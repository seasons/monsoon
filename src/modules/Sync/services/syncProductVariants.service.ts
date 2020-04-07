import {
  BottomSizeType,
  InventoryStatus,
  LetterSize,
  PhysicalProductCreateInput,
  ProductVariantCreateInput,
} from "../../../prisma"

import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { SyncBottomSizesService } from "./syncBottomSizes.service"
import { SyncProductsService } from "./syncProducts.service"
import { SyncSizesService } from "./syncSizes.service"
import { SyncTopSizesService } from "./syncTopSizes.service"
import { SyncUtilsService } from "./sync.utils.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { isEmpty } from "lodash"

enum ProductSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
  XXL = "XXL",
}

const SeasonsLocationID = "recvzTcW19kdBPqf4"

@Injectable()
export class SyncProductVariantsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncBottomSizesService: SyncBottomSizesService,
    private readonly syncProductsService: SyncProductsService,
    private readonly syncSizesService: SyncSizesService,
    private readonly syncTopSizesService: SyncTopSizesService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getProductVariantRecordIdentifier = rec => rec.fields.SKU

  async syncAirtableToAirtable(cliProgressBar?) {
    const allProductVariantsProduction = await this.airtableService.getAllProductVariants(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords(
      "Product Variants",
      cliProgressBar
    )
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Product Variants",
      allProductionRecords: allProductVariantsProduction,
      sanitizeFunc: fields =>
        this.utils.deleteFieldsFromObject(
          {
            ...fields,
            Product: [],
            "Physical Products": [],
            Orders: [],
            "Top Size": [],
            "Bottom Size": [],
          },
          ["Variant Number", "Created At", "Images", "Brand", "Color", "Type"]
        ),
      cliProgressBar,
    })
    const allProductVariantsStaging = await this.airtableService.getAllProductVariants(
      this.airtableService.getStagingBase()
    )
    await this.addProductLinks(
      allProductVariantsProduction,
      allProductVariantsStaging,
      cliProgressBar
    )
    await this.addTopSizeLinks(
      allProductVariantsProduction,
      allProductVariantsStaging,
      cliProgressBar
    )
    await this.addBottomSizeLinks(
      allProductVariantsProduction,
      allProductVariantsStaging,
      cliProgressBar
    )
  }

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
    const allLocations = await this.airtableService.getAllLocations()
    const allPhysicalProducts = await this.airtableService.getAllPhysicalProducts()
    const allTopSizes = await this.airtableService.getAllTopSizes()
    const allBottomSizes = await this.airtableService.getAllBottomSizes()
    const allSizes = await this.airtableService.getAllSizes()

    for (const productVariant of allProductVariants) {
      try {
        // Increment the progress bar
        progressBar.increment()

        // Extract the model data from the product variant
        const { model } = productVariant

        // Get the related product
        const product = allProducts.findByIds(model.product)
        if (isEmpty(product)) {
          continue
        }

        // Get the related brand, color, location, style, topsize, bottomSize
        const brand = allBrands.findByIds(product.model.brand)
        const color = allColors.find(x => x.model.name === product.model.color)
        const location = allLocations.find(x => x.id === SeasonsLocationID)
        const styleNumber = product.model.styleCode
        const topSize = allTopSizes.findByIds(model.topSize)
        const bottomSize = allBottomSizes.findByIds(model.bottomSize)

        // If there's no model or brand, or there's not appropriate size data, skip it.
        const { type } = product.model
        if (
          isEmpty(model) ||
          isEmpty(brand) ||
          (isEmpty(topSize) && isEmpty(bottomSize)) ||
          (type === "Top" && isEmpty(topSize)) ||
          (type === "Bottom" && isEmpty(bottomSize))
        ) {
          continue
        }

        //   Calculate the sku
        const sku = this.skuForData(
          brand,
          color,
          this.sizeNameForProductVariant(type, topSize, bottomSize, allSizes),
          styleNumber
        )

        const {
          totalCount,
          nonReservableCount,
          reservedCount,
          updatedReservableCount,
        } = this.countsForVariant(productVariant)

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
          internalSizeRecord = await this.syncSizesService.deepUpsertSize({
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
                await this.syncSizesService.deepUpsertSize({
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
            connect: manufacturerSizeRecords.map(a =>
              this.utils.Identity({
                id: a.id,
              })
            ),
          },
          weight: parseFloat(weight) || 0,
          height: parseFloat(height) || 0,
          total: totalCount,
          reservable: updatedReservableCount,
          reserved: reservedCount,
          nonReservable: nonReservableCount,
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
        const physicalProducts = allPhysicalProducts.filter(a =>
          (a.get("Product Variant") || []).includes(productVariant.id)
        )

        const newPhysicalProducts = await this.createMorePhysicalProductsIfNeeded(
          {
            sku,
            product,
            productVariant,
            physicalProducts,
            totalCount,
          }
        )

        newPhysicalProducts.forEach(async p => {
          await this.prisma.client.upsertPhysicalProduct({
            where: {
              seasonsUID: p.seasonsUID,
            },
            create: p,
            update: p,
          })
        })

        await productVariant.patchUpdate({
          SKU: sku,
          "Total Count": totalCount,
          "Reservable Count": updatedReservableCount,
          "Reserved Count": reservedCount,
          "Non-Reservable Count": nonReservableCount,
        })
      } catch (e) {
        console.log(productVariant)
        console.error(e)
      }
    }
    multibar?.stop()
  }

  private async addBottomSizeLinks(
    allProductionProductVariants: AirtableData,
    allStagingProductVariants: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Product Variants",
      targetFieldNameOnRootRecord: "Bottom Size",
      allRootProductionRecords: allProductionProductVariants,
      allRootStagingRecords: allStagingProductVariants,
      allTargetProductionRecords: await this.airtableService.getAllBottomSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllBottomSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductVariantRecordIdentifier,
      getTargetRecordIdentifer: this.syncBottomSizesService
        .getBottomSizeRecordIdentifer,
      cliProgressBar,
    })
  }

  private async addProductLinks(
    allProductionProductVariants: AirtableData,
    allStagingProductVariants: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Product Variants",
      targetFieldNameOnRootRecord: "Product",
      allRootProductionRecords: allProductionProductVariants,
      allRootStagingRecords: allStagingProductVariants,
      allTargetProductionRecords: await this.airtableService.getAllProducts(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllProducts(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductVariantRecordIdentifier,
      getTargetRecordIdentifer: this.syncProductsService
        .getProductRecordIdentifer,
      cliProgressBar,
    })
  }

  private async addTopSizeLinks(
    allProductionProductVariants: AirtableData,
    allStagingProductVariants: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Product Variants",
      targetFieldNameOnRootRecord: "Top Size",
      allRootProductionRecords: allProductionProductVariants,
      allRootStagingRecords: allStagingProductVariants,
      allTargetProductionRecords: await this.airtableService.getAllTopSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllTopSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductVariantRecordIdentifier,
      getTargetRecordIdentifer: this.syncTopSizesService
        .getTopSizeRecordIdentifier,
      cliProgressBar,
    })
  }

  private countsForVariant = productVariant => {
    const data = {
      totalCount: productVariant.get("Total Count") || 0,
      reservedCount: productVariant.get("Reserved Count") || 0,
      nonReservableCount: productVariant.get("Non-Reservable Count") || 0,
    }

    // Assume all newly added product variants are reservable, and calculate the
    // number of such product variants as the remainder once reserved and nonReservable
    // are taken into account
    const updatedData = {
      ...data,
      updatedReservableCount:
        data.totalCount - data.reservedCount - data.nonReservableCount,
    }

    const {
      totalCount,
      updatedReservableCount,
      reservedCount,
      nonReservableCount,
    } = updatedData

    // Make sure these counts make sense
    if (
      totalCount < 0 ||
      updatedReservableCount < 0 ||
      nonReservableCount < 0 ||
      totalCount !== reservedCount + nonReservableCount + updatedReservableCount
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
          inventoryStatus: "Reservable" as InventoryStatus,
          productStatus: fields["Product Status"],
        } as PhysicalProductCreateInput)
    )
  }

  private sizeNameForProductVariant = (type, topSize, bottomSize, allSizes) => {
    switch (type) {
      case "Top":
        return allSizes.findByIds(topSize.model.size)?.model.name
      case "Bottom":
        return allSizes.findByIds(bottomSize.model.size)?.model.name
      default:
        throw new Error(`Invalid product type: ${type}`)
    }
  }

  private sizeNameToSizeCode(sizeName: ProductSize | string) {
    switch (sizeName) {
      case ProductSize.XS:
        return "XS"
      case ProductSize.S:
        return "SS"
      case ProductSize.M:
        return "MM"
      case ProductSize.L:
        return "LL"
      case ProductSize.XL:
        return "XL"
      case ProductSize.XXL:
        return "XXL"
    }
  }

  private skuForData = (brand, color, sizeName, styleNumber) => {
    const brandCode = brand.get("Brand Code")
    const colorCode = color.get("Color Code")
    const sizeCode = this.sizeNameToSizeCode(sizeName)
    const styleCode = styleNumber.toString().padStart(3, "0")
    return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
  }
}
