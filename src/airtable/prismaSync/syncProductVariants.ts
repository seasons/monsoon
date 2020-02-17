import {
  getAllProducts,
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllBrands,
  getAllColors,
  getAllLocations,
} from "../utils"
import {
  prisma,
  InventoryStatus,
  PhysicalProductCreateInput,
  ProductVariantCreateInput,
} from "../../prisma"
import { sizeToSizeCode } from "../../utils"
import { base } from "../config"
import { isEmpty } from "lodash"

const SeasonsLocationID = "recvzTcW19kdBPqf4"

export const syncProductVariants = async () => {
  const allBrands = await getAllBrands()
  const allColors = await getAllColors()
  const allProducts = await getAllProducts()
  const allLocations = await getAllLocations()
  const allProductVariants = await getAllProductVariants()
  const allPhysicalProducts = await getAllPhysicalProducts()

  for (const productVariant of allProductVariants) {
    try {
      const { model } = productVariant

      const product = allProducts.findByIds(model.product)
      const brand = allBrands.findByIds(product.model.brand)
      const color = allColors.find(x => x.model.name === product.model.color)
      const location = allLocations.find(x => x.id === SeasonsLocationID)
      const styleNumber = product.model.styleCode

      if (isEmpty(model) || isEmpty(brand) || isEmpty(product)) {
        continue
      }

      const sku = skuForData(brand, color, productVariant, styleNumber)

      const {
        totalCount,
        nonReservableCount,
        reservedCount,
        updatedReservableCount,
      } = countsForVariant(productVariant)

      const { weight, height, size } = model

      let data = {
        sku,
        size,
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

      const productVariantData = await prisma.upsertProductVariant({
        where: {
          sku: sku,
        },
        create: {
          ...data,
        },
        update: {
          ...data,
        },
      })

      console.log(productVariantData)

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

const skuForData = (brand, color, productVariant, styleNumber) => {
  let brandCode = brand.get("Brand Code")
  let colorCode = color.get("Color Code")
  let size = productVariant.get("Size")
  let sizeCode = sizeToSizeCode(size)
  let styleCode = styleNumber.toString().padStart(3, "0")
  return `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
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
        .padStart(2, "0")

      newPhysicalProducts.push({
        fields: {
          SUID: {
            text: sku + `-${physicalProductID}`,
          },
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
