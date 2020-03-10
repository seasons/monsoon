import {
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllLocations,
} from "../utils"
import { prisma } from "../../prisma"
import { isEmpty } from "lodash"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncPhysicalProducts = async (cliProgressBar?) => {
  const allLocations = await getAllLocations()
  const allProductVariants = await getAllProductVariants()
  const allPhysicalProducts = await getAllPhysicalProducts()

  const [
    multibar,
    _cliProgressBar,
  ] = makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allPhysicalProducts.length,
    modelName: "Physical Products",
  })

  for (const record of allPhysicalProducts) {
    _cliProgressBar.increment()

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
    } catch (e) {
      console.error(e)
      break
    }
  }

  multibar?.stop()
}
