import slugify from "slugify"
import { prisma } from "../../prisma"
import { isEmpty } from "lodash"
import { getAllProducts, getAllHomepageProductRails } from "../utils"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncHomepageProductRails = async (cliProgressBar?) => {
  const records = await getAllHomepageProductRails()
  const allProducts = await getAllProducts()

  const [
    multibar,
    _cliProgressBar,
  ] = makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allProducts.length,
    modelName: "Products",
  })

  for (const record of records) {
    _cliProgressBar.increment()

    try {
      const { model } = record
      const products = allProducts.findMultipleByIds(model.products)
      const { name } = model

      if (isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()

      const data = {
        products: {
          connect: products.map(product => ({ slug: product.model.slug })),
        },
        slug,
        name,
      }

      await prisma.upsertHomepageProductRail({
        where: {
          slug,
        },
        create: {
          slug,
          ...data,
        },
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })
    } catch (e) {
      console.error(e)
    }
  }

  multibar?.stop()
}
