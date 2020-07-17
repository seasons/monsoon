import * as fs from "fs"

import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"

import {
  BottomSizeType,
  LetterSize,
  PhysicalProductCreateInput,
  ProductVariantCreateInput,
} from "../../../prisma"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { ProductUtilsService } from "../../Product/services/product.utils.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncProductVariantsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  async syncAirtableToPrisma(cliProgressBar?) {
    // Make the progress bar
    const allProductVariants = await this.airtableService.getAllProductVariants()
    const [
      multibar,
      progressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: allProductVariants.length,
      modelName: "Product Variants",
    })

    // Get all the relevant airtable records
    const allBrands = await this.airtableService.getAllBrands()
    const allColors = await this.airtableService.getAllColors()
    const allProducts = await this.airtableService.getAllProducts()
    const allPhysicalProducts = await this.airtableService.getAllPhysicalProducts()
    const allTopSizes = await this.airtableService.getAllTopSizes()
    const allBottomSizes = await this.airtableService.getAllBottomSizes()
    const allSizes = await this.airtableService.getAllSizes()

    let numSkipped = 0
    const logFile = this.utils.openLogFile("syncProductVariants")
    for (const productVariant of allProductVariants) {
      try {
        // Increment the progress bar
        progressBar.increment()

        // Extract the model data from the product variant
        const { model } = productVariant

        // Get the related product
        const product = allProducts.findByIds(model.product)
        if (isEmpty(product) || isEmpty(product.model.slug)) {
          continue
        }

        // Get the related brand, color, location, style, topsize, bottomSize
        const brand = allBrands.findByIds(product.model.brand)
        const color = allColors.find(x => x.model.name === product.model.color)
        const styleNumber = product.model.styleCode
        const topSize = allTopSizes.findByIds(model.topSize)
        const bottomSize = allBottomSizes.findByIds(model.bottomSize)

        // If there's no model or brand, or there's not appropriate size data, skip it.
        const { type } = product.model
        const { isMissing, explanation } = this.missingCriticalData(
          type,
          model,
          brand,
          topSize,
          bottomSize
        )
        if (isMissing) {
          numSkipped += 1
          this.utils.writeLines(logFile, [
            "SKIPPED RECORD",
            `Airtable record id: ${productVariant.id}`,
            `Explanation: ${explanation}`,
            "Record:",
            productVariant,
          ])
          continue
        }

        //   Calculate the sku
        const sku = this.skuForData(
          brand,
          color,
          this.sizeNameForProductVariant(type, topSize, bottomSize, allSizes),
          styleNumber
        )

        const physicalProducts = allPhysicalProducts.filter(a =>
          (a.get("Product Variant") || []).includes(productVariant.id)
        )
        const {
          totalCount,
          updatedNonReservableCount,
          reservedCount,
          reservableCount,
          storedCount,
          offloadedCount,
        } = this.countsForVariant(productVariant, physicalProducts)

        const { weight, height } = model

        let internalSizeRecord
        if (!!topSize || !!bottomSize) {
          let linkedAirtableSize
          switch (type) {
            case "Top":
              linkedAirtableSize = allSizes.findByIds(topSize.model.size)
              break
            case "Bottom":
              linkedAirtableSize = allSizes.findByIds(bottomSize.model.size)
              break
          }
          internalSizeRecord = await this.productUtils.deepUpsertSize({
            slug: `${sku}-internal`,
            type,
            display: linkedAirtableSize?.model.display || "",
            topSizeData: type === "Top" &&
              !!topSize && {
                letter: (linkedAirtableSize?.model.name as LetterSize) || null,
                sleeve: topSize.model.sleeve,
                shoulder: topSize.model.shoulder,
                chest: topSize.model.chest,
                neck: topSize.model.neck,
                length: topSize.model.length,
              },
            bottomSizeData: type === "Bottom" &&
              !!bottomSize && {
                type:
                  (linkedAirtableSize?.model.type as BottomSizeType) || null,
                value: linkedAirtableSize?.model.name || "",
                waist: bottomSize.model.waist,
                rise: bottomSize.model.rise,
                hem: bottomSize.model.hem,
                inseam: bottomSize.model.inseam,
              },
          })
        }

        // If the product variant is a bottom, then create manufacturer sizes
        const manufacturerSizeRecords = []
        if (type === "Bottom") {
          // Delete all existing manufacturer size records so if an admin removes
          // a size record from a product variant on airtable, it does not linger on the db record
          const existingManufacturerSizes = await this.prisma.client
            .productVariant({ sku })
            .manufacturerSizes()
          await this.prisma.client.deleteManySizes({
            id_in: existingManufacturerSizes?.map(a => a.id) || [],
          })

          // For each manufacturer size, store the name, type, and display value
          if (!!bottomSize?.model.manufacturerSizes) {
            let i = 0
            for (const manufacturerSizeId of bottomSize.model
              .manufacturerSizes) {
              const manufacturerSizeRecord = allSizes.findByIds(
                manufacturerSizeId
              )
              const {
                display,
                type,
                name: value,
              } = manufacturerSizeRecord.model
              manufacturerSizeRecords.push(
                await this.productUtils.deepUpsertSize({
                  slug: `${sku}-manu-${type}-${value}`,
                  type: "Bottom",
                  display,
                  topSizeData: null,
                  bottomSizeData: {
                    type,
                    value,
                  },
                })
              )
            }
          }
        }

        const data = {
          sku,
          internalSize: {
            connect: {
              id: internalSizeRecord.id,
            },
          },
          manufacturerSizes: {
            connect: manufacturerSizeRecords.map(a => ({
              id: a.id,
            })),
          },
          weight: parseFloat(weight) || 0,
          height: parseFloat(height) || 0,
          total: totalCount,
          reservable: reservableCount,
          reserved: reservedCount,
          offloaded: offloadedCount,
          stored: storedCount,
          nonReservable: updatedNonReservableCount,
          color: {
            connect: {
              slug: color.model.slug,
            },
          },
          product: {
            connect: {
              slug: product.model.slug,
            },
          },
          productID: product.model.slug,
        } as ProductVariantCreateInput

        await this.prisma.client.upsertProductVariant({
          where: {
            sku,
          },
          create: {
            ...data,
          },
          update: {
            ...data,
          },
        })

        // Figure out if we need to create new instance of physical products
        // based on the counts and what's available in the database
        const newPhysicalProducts = await this.createMorePhysicalProductsIfNeeded(
          {
            sku,
            product,
            productVariant,
            physicalProducts,
            totalCount,
          }
        )

        for (const p of newPhysicalProducts) {
          await this.prisma.client.upsertPhysicalProduct({
            where: {
              seasonsUID: p.seasonsUID,
            },
            create: p,
            update: p,
          })
        }

        await productVariant.patchUpdate({
          SKU: sku,
          "Total Count": totalCount,
          "Reservable Count": reservableCount,
          "Reserved Count": reservedCount,
          "Non-Reservable Count": updatedNonReservableCount,
        })

        this.updateCategorySizeName(type, topSize, bottomSize, sku)
      } catch (e) {
        this.syncUtils.logSyncError(logFile, productVariant, e)
      }
    }
    this.utils.writeLines(logFile, [`Skipped ${numSkipped} records`])
    multibar?.stop()
    fs.closeSync(logFile)
  }

  private missingCriticalData(type, model, brand, topSize, bottomSize) {
    const possibleIssues = {
      noModel: isEmpty(model),
      noBrand: isEmpty(brand),
      noSize: isEmpty(topSize) && isEmpty(bottomSize),
      isTopButNoTopSize: type === "Top" && isEmpty(topSize),
      isTopButNoSizeOnTopSize:
        type === "Top" && !isEmpty(topSize) && !topSize?.model?.size,
      isBottomButNoBottomSize: type === "Bottom" && isEmpty(bottomSize),
      isBottomButNoSizeOnBottomSize:
        type === "Bottom" && !isEmpty(bottomSize) && !bottomSize?.model?.size,
    }

    const possibleIssue = Object.keys(possibleIssues).find(
      a => possibleIssues[a]
    )
    return {
      isMissing: !!possibleIssue,
      explanation: `${possibleIssue || ""}`,
    }
  }

  private countsForVariant = (productVariant, physicalProducts) => {
    const data = {
      totalCount: productVariant.get("Total Count") || 0,
      reservedCount: productVariant.get("Reserved Count") || 0,
      nonReservableCount: productVariant.get("Non-Reservable Count") || 0,
      reservableCount: productVariant.get("Reservable Count") || 0,
      storedCount: productVariant.get("Stored Count") || 0,
      offloadedCount: productVariant.get("Offloaded Count") || 0,
    }

    // Assume all newly added product variants are nonReservable, and calculate the
    // number of such product variants as the remainder once all other counts are
    // taken into account
    const updatedData = {
      ...data,
      updatedNonReservableCount:
        data.totalCount -
        data.reservedCount -
        data.reservableCount -
        data.storedCount -
        data.offloadedCount,
    }

    const {
      totalCount,
      updatedNonReservableCount,
      reservedCount,
      reservableCount,
      storedCount,
      offloadedCount,
    } = updatedData

    // Make sure these counts make sense
    if (
      totalCount < 0 ||
      updatedNonReservableCount < 0 ||
      reservedCount < 0 ||
      reservableCount < 0 ||
      storedCount < 0 ||
      offloadedCount < 0 ||
      totalCount !==
        reservedCount +
          updatedNonReservableCount +
          reservableCount +
          storedCount +
          offloadedCount
    ) {
      throw new Error(`Invalid counts: ${updatedData}`)
    }

    return updatedData
  }

  private async createMorePhysicalProductsIfNeeded({
    sku,
    productVariant,
    product,
    physicalProducts,
    totalCount,
  }) {
    const physicalProductCount = physicalProducts.length
    const newPhysicalProducts: any[] = []

    // We need to create more physical products
    if (physicalProductCount < totalCount) {
      for (let i = 1; i <= totalCount - physicalProductCount; i++) {
        const physicalProductID = (physicalProductCount + i)
          .toString()
          .padStart(2, "0")

        newPhysicalProducts.push({
          fields: {
            SUID: {
              text: sku + `-${physicalProductID}`,
            },
            Product: [product.id],
            "Product Variant": [productVariant.id],
            "Inventory Status": "Non Reservable",
            "Product Status": "New",
            "Sequence Number": await this.airtableService.getNextPhysicalProductSequenceNumber(),
          },
        })
      }
      await this.airtableService.createPhysicalProducts(newPhysicalProducts)
    }

    return newPhysicalProducts.map(
      ({ fields }) =>
        ({
          seasonsUID: fields.SUID.text,
          productVariant: {
            connect: {
              sku,
            },
          },
          inventoryStatus: this.airtableService.airtableToPrismaInventoryStatus(
            fields["Inventory Status"]
          ),
          productStatus: fields["Product Status"],
          sequenceNumber: fields["Sequence Number"],
        } as PhysicalProductCreateInput)
    )
  }

  private sizeNameForProductVariant = (type, topSize, bottomSize, allSizes) => {
    switch (type) {
      case "Top":
        return allSizes.findByIds(topSize.model.size).model.name
      case "Bottom":
        return allSizes.findByIds(bottomSize.model.size).model.name
      default:
        throw new Error(`Invalid product type: ${type}`)
    }
  }

  private async updateCategorySizeName(type, topSize, bottomSize, sku) {
    switch (type) {
      case "Top":
        return await topSize?.patchUpdate({ Name: sku })
      case "Bottom":
        return await bottomSize?.patchUpdate({ Name: sku })
      default:
        throw new Error(`Invalid product type: ${type}`)
    }
  }

  private skuForData = (brand, color, sizeName, styleNumber) => {
    const brandCode = brand.get("Brand Code")
    const colorCode = color.get("Color Code")
    const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
    const styleCode = styleNumber.toString().padStart(3, "0")
    return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
  }
}
