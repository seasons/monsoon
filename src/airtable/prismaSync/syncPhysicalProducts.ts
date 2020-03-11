import { getAllProductVariants, getAllPhysicalProducts } from "../utils"
import { prisma } from "../../prisma"
import { isEmpty } from "lodash"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncPhysicalProducts = async (cliProgressBar?) => {
  const allProductVariants = await getAllProductVariants()
  const allPhysicalProducts = await getAllPhysicalProducts()

  const [
    multibar,
    _cliProgressBar,
  ] = await makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allPhysicalProducts.length,
    modelName: "Physical Products",
  })

  for (const record of allPhysicalProducts) {
    _cliProgressBar.increment()

    try {
      const { model } = record

      const productVariant = allProductVariants.findByIds(model.productVariant)

      if (isEmpty(model)) {
        continue
      }

      const { sUID, inventoryStatus, productStatus } = model

      if (sUID.text.startsWith("HEVO-RED")) {
        continue
      }

      const data = {
        productVariant: {
          connect: {
            sku: productVariant.model.sKU,
          },
        },
        seasonsUID: sUID.text,
        inventoryStatus: inventoryStatus.replace(" ", ""),
        productStatus,
      }

      await prisma.upsertPhysicalProduct({
        where: {
          seasonsUID: sUID.text,
        },
        create: data,
        update: data,
      })
    } catch (e) {
      console.error(e)
    }
  }

  multibar?.stop()
}
