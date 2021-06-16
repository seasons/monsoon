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
        slug
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

  let count = 0
  let total = productVariants.length
  for (const productVariant of productVariants) {
    console.log(`${count++} of ${total}`)
    const size = head(productVariant.manufacturerSizes)
    const oldSlug = size.slug
    console.log(oldSlug)
    // const oldSlugParts = oldSlug.split("-")
    // const newSlug = oldSlugParts.splice(0, oldSlugParts.length - 1).join("-")
    // await ps.client2.size.update({
    //   where: { slug: oldSlug },
    //   data: { slug: newSlug },
    // })
  }
}

run()
