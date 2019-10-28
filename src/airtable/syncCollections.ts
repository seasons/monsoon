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
      const product = allProducts.findByIds(model.product)
      const {
        description,
        title,
        subTitle,
        images,
      } = model

      if (isEmpty(images) || isEmpty(title)) {
        continue
      }

      const slug = slugify(title).toLowerCase()

      const data = {
        product: {
          connect: {
            slug: product.model.slug,
          },
        },
        slug,
        title,
        subTitle,
        description,
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
