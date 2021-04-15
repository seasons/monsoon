import "module-alias/register"

import { head } from "lodash"

import { ProductUtilsService } from "../modules/Product/services/product.utils.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const productUtils = new ProductUtilsService(ps, utils)

  const productVariants = await ps.binding.query.productVariants(
    {},
    `{
      id
      sku
      displayShort
      manufacturerSizes {
        id
        display
        productType
        type
      }
  }`
  )

  for (const variant of productVariants) {
    const manufacturerSizes = variant.manufacturerSizes
    const manufacturerSize = head(manufacturerSizes)

    let displayShort
    // If top exit early because we are only using internalSizes for tops
    if (manufacturerSize?.display && manufacturerSize?.type) {
      displayShort = productUtils.coerceSizeDisplayIfNeeded(
        manufacturerSize.display,
        manufacturerSize.type,
        manufacturerSize.productType
      )

      if (manufacturerSize.type === "WxL") {
        displayShort = displayShort.split("x")[0]
      }

      if (!!displayShort && displayShort !== variant.displayShort) {
        console.log(
          "SKU: ",
          variant.sku,
          " / Old displayshort: ",
          variant.displayShort,
          " / new display short: ",
          displayShort
        )
        await ps.client.updateProductVariant({
          where: { id: variant.id },
          data: { displayShort },
        })
      }
    } else {
      console.log(
        "No data for: ",
        variant.sku,
        " / Display ",
        manufacturerSize?.display,
        " / type ",
        manufacturerSize?.type
      )
    }
  }
}

run()
