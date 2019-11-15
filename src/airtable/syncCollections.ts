import slugify from "slugify"
import { prisma } from "../prisma"
import { isEmpty } from "lodash"
import { getAllCollections, getAllProducts } from "./utils"

export const syncCollections = async () => {
  const records = await getAllCollections()
  const allProducts = await getAllProducts()

  for (let record of records) {
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

      const collection = await prisma.upsertCollection({
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

      console.log(collection)
    } catch (e) {
      console.error(e)
    }
  }
}
