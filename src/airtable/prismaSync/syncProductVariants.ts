import {
  getAllProducts,
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllBrands,
  getAllColors,
  getAllLocations,
  getAllTopSizes,
  getAllBottomSizes,
  getAllSizes,
} from "../utils"
import {
  prisma,
  InventoryStatus,
  PhysicalProductCreateInput,
  ProductVariantCreateInput,
  LetterSize,
  BottomSizeType,
} from "../../prisma"
import { sizeToSizeCode, Identity } from "../../utils"
import { base } from "../config"
import { isEmpty } from "lodash"
import {
  makeSingleSyncFuncMultiBarAndProgressBarIfNeeded,
  deepUpsertSize,
} from "./utils"

const SeasonsLocationID = "recvzTcW19kdBPqf4"

export const syncProductVariants = async (cliProgressBar?) => {
  //   Make the progress bar
  const allProductVariants = await getAllProductVariants()
  const [
    multibar,
    _cliProgressBar,
  ] = await makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allProductVariants.length,
    modelName: "Product Variants",
  })

  // Get all the relevant airtable records
  const allBrands = await getAllBrands()
  const allColors = await getAllColors()
  const allProducts = await getAllProducts()
  const allLocations = await getAllLocations()
  const allPhysicalProducts = await getAllPhysicalProducts()
  const allTopSizes = await getAllTopSizes()
  const allBottomSizes = await getAllBottomSizes()
  const allSizes = await getAllSizes()

  for (const productVariant of allProductVariants) {
    try {
      // Increment the progress bar
      _cliProgressBar.increment()

      //   Extract the model data from the product variant
      const { model } = productVariant

      //   Get the related product
      const product = allProducts.findByIds(model.product)
      if (isEmpty(product)) {
        continue
      }

      //   Get the related brand, color, location, style, topsize, bottomSize
      const brand = allBrands.findByIds(product.model.brand)
      const color = allColors.find(x => x.model.name === product.model.color)
      const location = allLocations.find(x => x.id === SeasonsLocationID)
      const styleNumber = product.model.styleCode
      const topSize = allTopSizes.findByIds(model.topSize)
      const bottomSize = allBottomSizes.findByIds(model.bottomSize)

      //   If there's no model or brand, skip it.
      if (isEmpty(model) || isEmpty(brand)) {
        continue
      }

      //   Calculate the sku
      const sku = skuForData(brand, color, productVariant, styleNumber)
      const { type } = product.model

      const {
        totalCount,
        nonReservableCount,
        reservedCount,
        updatedReservableCount,
      } = countsForVariant(productVariant)

      const { weight, height, size } = model

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
        internalSizeRecord = await deepUpsertSize({
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
              type: (linkedAirtableSize?.model.type as BottomSizeType) || null,
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
        if (sku === "ORSL-BLU-MM-001") {
          console.log('yo")')
        }
        const existingManufacturerSizes = await prisma
          .productVariant({ sku })
          .manufacturerSizes()
        await prisma.deleteManySizes({
          id_in: existingManufacturerSizes?.map(a => a.id) || [],
        })

        // For each manufacturer size, store the name, type, and display value
        if (!!bottomSize?.model.manufacturerSizes) {
          let i = 0
          for (const manufacturerSizeId of bottomSize.model.manufacturerSizes) {
            const manufacturerSizeRecord = allSizes.findByIds(
              manufacturerSizeId
            )
            const { display, type, name: value } = manufacturerSizeRecord.model
            manufacturerSizeRecords.push(
              await deepUpsertSize({
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
            Identity({
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

      await prisma.upsertProductVariant({
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

      const newPhysicalProducts = await createMorePhysicalProductsIfNeeded({
        sku,
        location,
        product,
        productVariant,
        physicalProducts,
        totalCount,
      })

      newPhysicalProducts.forEach(async p => {
        await prisma.upsertPhysicalProduct({
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

const skuForData = (brand, color, productVariant, styleNumber) => {
  const brandCode = brand.get("Brand Code")
  const colorCode = color.get("Color Code")
  const size = productVariant.get("Size")
  const sizeCode = sizeToSizeCode(size)
  const styleCode = styleNumber.toString().padStart(3, "0")
  return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
}

const countsForVariant = productVariant => {
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

  // Make sure these counts make sense
  if (
    updatedData.totalCount < 0 ||
    updatedData.updatedReservableCount < 0 ||
    updatedData.nonReservableCount < 0 ||
    updatedData.totalCount < 0 ||
    updatedData.totalCount !==
      updatedData.reservedCount +
        updatedData.nonReservableCount +
        updatedData.updatedReservableCount
  ) {
    throw new Error(`Invalid counts: ${updatedData}`)
  }

  return updatedData
}

type CreateMorePhysicalProductsFunction = (data: {
  sku: string
  location: any
  productVariant: any
  product: any
  physicalProducts: any[]
  totalCount: number
}) => Promise<any[]>

const createMorePhysicalProductsIfNeeded: CreateMorePhysicalProductsFunction = async ({
  sku,
  location,
  productVariant,
  product,
  physicalProducts,
  totalCount,
}) => {
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
    await base("Physical Products").create(newPhysicalProducts)
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

syncProductVariants()
