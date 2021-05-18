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
      displayShort
      manufacturerSizes {
        id
        display
        productType
        type
        bottom {
          id
          value
          type
        }
        top {
          id
          letter
        }
      }
  }`
  )

  for (const productVariant of productVariants) {
    const size = head(productVariant.manufacturerSizes)
    // Fix for JP sizes
    if (size.type === "EU") {
      const display = productUtils.coerceSizeDisplayIfNeeded(
        size.display,
        size.type,
        size.productType
      )
      if (display !== productVariant.displayShort) {
        console.log(
          "Updating: ",
          productVariant.id,
          " / Old display ",
          productVariant.displayShort,
          " / New display ",
          display
        )
        await ps.client.updateProductVariant({
          where: { id: productVariant.id },
          data: {
            displayShort: display,
          },
        })
      }
    }
  }
}

run()
