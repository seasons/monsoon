import {
  getAllProducts,
  getAllProductVariants,
  getAllBrands,
  getAllColors,
} from "./utils"
import { prisma } from "../prisma"
import { sizeToSizeCode } from "../utils"

export const syncProductVariants = async () => {
  try {
    const allBrands = await getAllBrands()
    const allProducts = await getAllProducts()
    const allProductVariants = await getAllProductVariants()
    const allColors = await getAllColors()

    for (let productVariant of allProductVariants) {
      let productId = productVariant.get("Product")[0]
      let product = allProducts.find(x => x.id === productId)

      let brandId = product.get("Brand")[0]
      let brand = allBrands.find(x => x.id === brandId)

      let colorId = productVariant.get("Primary Color")[0]
      let color = allColors.find(x => x.id === colorId)

      if (product && brand) {
        let brandCode = brand.get("Brand Code")
        let colorCode = color.get("Color Code")
        let sizeCode = sizeToSizeCode(productVariant.get("Size"))
        let upc = (productVariant.get("UPC") || { text: "" }).text
        let sku = `${brandCode}-${colorCode}-${sizeCode}`

        let pvSeasonsID = productVariant.get("Seasons ID")
        let data = {
          sku,
          upc,
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
          inventoryLevel: {
            create: {
              product: {
                connect: {
                  id: product.get("Seasons ID"),
                },
              },
              reservable: productVariant.get("Reservable Count") || 0,
              reserved: productVariant.get("Reserved Count") || 0,
              nonReservable: 0,
            },
          },
        }

        // TODO: Figure out if we need to create new instance of physical products
        // based on the counts and what's available in the database

        const productVariantData = !!pvSeasonsID
          ? await prisma.upsertProductVariant({
              where: {
                id: pvSeasonsID,
              },
              create: data,
              update: data,
            })
          : await prisma.createProductVariant(data)

        await productVariant.patchUpdate({
          SKU: sku,
          "Seasons ID": productVariantData.id,
        })
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// syncProductVariants()
