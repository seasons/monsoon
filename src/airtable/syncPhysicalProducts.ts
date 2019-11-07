import {
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllLocations,
} from "./utils"
import { prisma } from "../prisma"
import { isEmpty } from "lodash"

export const syncPhysicalProducts = async () => {
  const allLocations = await getAllLocations()
  const allProductVariants = await getAllProductVariants()
  const allPhysicalProducts = await getAllPhysicalProducts()

  let i = 1

  for (let record of allPhysicalProducts) {
    try {
      const { model } = record

      const productVariant = allProductVariants.findByIds(model.productVariant)
      const location = allLocations.findByIds(model.location)

      if (isEmpty(model)) {
        continue
      }

      const { sUID, inventoryStatus, productStatus } = model

      const data = {
        productVariant: {
          connect: {
            sku: productVariant.model.sKU,
          },
        },
        location: {
          connect: {
            slug: location.model.slug,
          },
        },
        seasonsUID: sUID.text,
        inventoryStatus: inventoryStatus.replace(" ", ""),
        productStatus,
      }

      const physicalProduct = await prisma.upsertPhysicalProduct({
        where: {
          seasonsUID: sUID.text,
        },
        create: data,
        update: data,
      })

      console.log(i++, physicalProduct)
    } catch (e) {
      console.error(e)
    }
  }
}

syncPhysicalProducts()
