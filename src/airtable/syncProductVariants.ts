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

export const syncProductVariants = async () => {
  try {
    const allBrands = await getAllBrands()
    const allColors = await getAllColors()
    const allProducts = await getAllProducts()
    const allLocations = await getAllLocations()
    const allProductVariants = await getAllProductVariants()
    const allPhysicalProducts = await getAllPhysicalProducts()

    for (let productVariant of allProductVariants) {
      let productId = productVariant.get("Product")[0]
      let product = allProducts.find(x => x.id === productId)

      let brandId = product.get("Brand")[0]
      let brand = allBrands.find(x => x.id === brandId)

      let colorName = product.get("Color")
      let color = allColors.find(x => x.get("Name") === colorName)

      let seasonsLocationID = "recvzTcW19kdBPqf4"
      let location = allLocations.find(x => x.id === seasonsLocationID)

      if (product && brand) {
        let brandCode = brand.get("Brand Code")
        let colorCode = color.get("Color Code")
        let sizeCode = sizeToSizeCode(productVariant.get("Size"))
        let sku = `${brandCode}-${colorCode}-${sizeCode}`
        let totalCount = productVariant.get("Total Count") || 0
        let reservedCount = productVariant.get("Reserved Count") || 0
        let nonReservableCount = productVariant.get("Non-Reservable Count") || 0
        let updatedReservableCount = totalCount - reservedCount

        // Figure out if we need to create new instance of physical products
        // based on the counts and what's available in the database
        const physicalProducts = allPhysicalProducts.filter(a =>
          (a.get("Product") || []).includes(productId)
        )
        const physicalProductCount = physicalProducts.length
        const newPhysicalProducts = []

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
                Location: [seasonsLocationID], // Seasons HQ
                "Product Variant": [productVariant.id],
                "Inventory Status": "Non Reservable",
                "Product Status": "New",
              },
            })
          }
          await base("Physical Products").create(newPhysicalProducts)
        }

        const inventoryLevel = {
          product: {
            connect: {
              id: product.get("Seasons ID"),
            },
          },
          total: totalCount,
          reservable: updatedReservableCount,
          reserved: reservedCount,
          nonReservable: nonReservableCount,
        }

        let data = {
          sku,
          images: productVariant.get("Images"),
          weight: productVariant.get("Weight") || 0,
          height: productVariant.get("Height") || 0,
          color: !!color && {
            connect: {
              id: color.get("Seasons ID"),
            },
          },
          product: {
            connect: {
              id: product.get("Seasons ID"),
            },
          },
          physicalProducts: {
            create: newPhysicalProducts.map(
              ({ fields }) =>
                ({
                  seasonsUID: fields.SUID,
                  location: {
                    connect: {
                      id: location.get("Seasons ID"),
                    },
                  },
                  inventoryStatus: "NonReservable" as InventoryStatus,
                  productStatus: fields["Product Status"],
                } as PhysicalProductCreateInput)
            ),
          },
        }

        try {
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

          await productVariant.patchUpdate({
            SKU: sku,
            "Seasons ID": productVariantData.id,
          })
        } catch (e) {
          console.error(e)
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

syncProductVariants()
