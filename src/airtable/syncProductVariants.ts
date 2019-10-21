import {
  getAllProducts,
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllBrands,
  getAllColors,
  getAllLocations,
} from "./utils"
import { prisma, InventoryStatus, PhysicalProductCreateInput } from "../prisma"
import { sizeToSizeCode } from "../utils"
import { base } from "./config"
import { isEmpty } from "lodash"

const SeasonsLocationID = "recvzTcW19kdBPqf4"

export const syncProductVariants = async () => {
  const allBrands = await getAllBrands()
  const allColors = await getAllColors()
  const allProducts = await getAllProducts()
  const allLocations = await getAllLocations()
  const allProductVariants = await getAllProductVariants()
  const allPhysicalProducts = await getAllPhysicalProducts()

  for (let productVariant of allProductVariants) {
    try {
      const { model } = productVariant

      const product = allProducts.findByIds(model.product)
      const brand = allBrands.findByIds(product.model.brand)
      const color = allColors.find(x => x.model.name === product.model.color)
      const location = allLocations.find(x => x.id === SeasonsLocationID)

      if (isEmpty(model) || isEmpty(brand) || isEmpty(product)) {
        continue
      }

      const sku = skuForData(brand, color, productVariant)

      const {
        totalCount,
        nonReservableCount,
        reservedCount,
        updatedReservableCount,
      } = countsForVariant(productVariant)

      const inventoryLevel = {
        product: {
          connect: {
            slug: product.model.slug,
          },
        },
        total: totalCount,
        reservable: updatedReservableCount,
        reserved: reservedCount,
        nonReservable: nonReservableCount,
      }

      const { weight, height } = model

      let data = {
        sku,
        weight: weight || 0,
        height: height || 0,
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
      }

      const productVariantData = await prisma.upsertProductVariant({
        where: {
          sku: sku,
        },
        create: {
          ...data,
          inventoryLevel: {
            create: inventoryLevel,
          },
        },
        update: {
          ...data,
        },
      })

      console.log(productVariantData)

      // Figure out if we need to create new instance of physical products
      // based on the counts and what's available in the database
      const physicalProducts = allPhysicalProducts.filter(a =>
        (a.get("Product") || []).includes(product.id)
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

        console.log(updatePhysicalProduct)
      })

      await productVariant.patchUpdate({
        SKU: sku,
        "Total Count": totalCount,
        "Reservable Count": updatedReservableCount,
        "Reserved Count": reservedCount,
        "Non-Reservable Count": nonReservableCount,
      })
    } catch (e) {
      console.error(e)
    }
  }
}

const skuForData = (brand, color, productVariant) => {
  let brandCode = brand.get("Brand Code")
  let colorCode = color.get("Color Code")
  let sizeCode = sizeToSizeCode(productVariant.get("Size"))
  return `${brandCode}-${colorCode}-${sizeCode}`
}

const countsForVariant = productVariant => {
  let data = {
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
        .padStart(5, "0")

      newPhysicalProducts.push({
        fields: {
          SUID: sku + `-${physicalProductID}`,
          Product: [product.id],
          Location: [SeasonsLocationID], // Seasons HQ
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
        seasonsUID: fields.SUID,
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
        inventoryStatus: "NonReservable" as InventoryStatus,
        productStatus: fields["Product Status"],
      } as PhysicalProductCreateInput)
  )
}

syncProductVariants()
