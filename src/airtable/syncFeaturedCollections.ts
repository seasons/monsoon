import slugify from "slugify"
import { prisma } from "../prisma"
import { isEmpty } from "lodash"
import { getAllCollections, getAllFeaturedCollections } from "./utils"

export const syncFeaturedCollections = async () => {
  const records = await getAllFeaturedCollections()
  const allCollections = await getAllCollections()

  for (let record of records) {
    try {
      const { model } = record
      const collections = allCollections.findMultipleByIds(model.collections)
      const {
        title,
      } = model

      if (isEmpty(title)) {
        continue
      }

      const slug = slugify(title).toLowerCase()

      const data = {
        collections: {
          connect: collections.map(collection => {
            return { slug: collection.model.slug }
          })
        },
        slug,
      }

      const featuredCollection = await prisma.upsertFeaturedCollection({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(featuredCollection)
    } catch (e) {
      console.error(e)
    }
  }
}

syncFeaturedCollections()