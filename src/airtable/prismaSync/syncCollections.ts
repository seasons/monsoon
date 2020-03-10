import slugify from "slugify"
import { prisma } from "../../prisma"
import { isEmpty } from "lodash"
import { getAllCollections, getAllProducts } from "../utils"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncCollections = async (cliProgressBar?) => {
  const records = await getAllCollections()
  const allProducts = await getAllProducts()

  const [
    multibar,
    _cliProgressBar,
  ] = makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: allProducts.length,
    modelName: "Collections",
  })

  for (const record of records) {
    _cliProgressBar.increment()
    try {
      const { model } = record
      const products = allProducts.findMultipleByIds(model.products)
      const {
        descriptionTop,
        descriptionBottom,
        title,
        subTitle,
        images,
      } = model

      if (isEmpty(images) || isEmpty(title)) {
        continue
      }

      const slug = slugify(title).toLowerCase()

      const data = {
        products: {
          connect: products.map(product => ({ slug: product.model.slug })),
        },
        slug,
        title,
        subTitle,
        descriptionTop,
        descriptionBottom,
        images,
      }

      await prisma.upsertCollection({
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
