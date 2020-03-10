import {
  getAllProducts,
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllBrands,
  getAllColors,
  getAllLocations,
  getAllTopSizes,
  getAllBottomSizes,
} from "../utils"
import {
  prisma,
  InventoryStatus,
  PhysicalProductCreateInput,
  ProductVariantCreateInput,
  SizeCreateInput,
  ProductType,
  TopSize,
  TopSizeCreateOneInput,
} from "../../prisma"
import { sizeToSizeCode } from "../../utils"
import { base } from "../config"
import { isEmpty } from "lodash"
import cliProgress from "cli-progress"
import {
  makeSingleSyncFuncMultiBarAndProgressBarIfNeeded,
  deepUpsertSize,
} from "./utils"

const SeasonsLocationID = "recvzTcW19kdBPqf4"

export const syncProductVariants = async (cliProgressBar?) => {
  const allBrands = await getAllBrands()
  const allColors = await getAllColors()
  const allProducts = await getAllProducts()
  const allLocations = await getAllLocations()
  const allProductVariants = await getAllProductVariants()
  const allPhysicalProducts = await getAllPhysicalProducts()
  const allTopSizes = await getAllTopSizes()
  const allBottomSizes = await getAllBottomSizes()

  const [
    multibar,
    _cliProgressBar,
  ] = makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allProductVariants.length,
    modelName: "Product Variants",
  })

  for (const productVariant of allProductVariants) {
    try {
      _cliProgressBar.increment()
      const { model } = productVariant

      const product = allProducts.findByIds(model.product)
      if (isEmpty(product)) {
        continue
      }

      const brand = allBrands.findByIds(product.model.brand)
      const color = allColors.find(x => x.model.name === product.model.color)
      const location = allLocations.find(x => x.id === SeasonsLocationID)
      const styleNumber = product.model.styleCode
      const topSize = allTopSizes.findByIds(model.topSize)
      const bottomSize = allBottomSizes.findByIds(model.bottomSize)

      if (isEmpty(model) || isEmpty(brand)) {
        continue
      }

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
        internalSizeRecord = await deepUpsertSize({
          slug: sku,
          type,
          airtableTopSize: topSize,
          airtableBottomSize: bottomSize,
        })
      }

      const data = {
        sku,
        size,
        internalSize: {
          connect: {
            id: internalSizeRecord.id,
          },
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
        const updatePhysicalProduct = await prisma.upsertPhysicalProduct({
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

  return {
    ...data,
    updatedReservableCount: data.totalCount - data.reservedCount,
  }
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
        location: {
          connect: {
            slug: location.model.slug,
          },
        },
        inventoryStatus: "Reservable" as InventoryStatus,
        productStatus: fields["Product Status"],
      } as PhysicalProductCreateInput)
  )
}

// syncProductVariants()
