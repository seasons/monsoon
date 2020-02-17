import slugify from "slugify"
import { prisma } from "../../prisma"
import { isEmpty } from "lodash"
import { getAllCollections, getAllCollectionGroups } from "../utils"

export const syncCollectionGroups = async () => {
  const records = await getAllCollectionGroups()
  const allCollections = await getAllCollections()

  for (let record of records) {
    try {
      const { model } = record
      const collections = allCollections.findMultipleByIds(model.collections)
      const { title } = model

      if (isEmpty(title)) {
        continue
      }

      const slug = slugify(title).toLowerCase()

      const data = {
        collections: {
          connect: collections.map(collection => {
            return { slug: collection.model.slug }
          }),
        },
        collectionCount: collections.length,
        title,
        slug,
      }

      const collectionGroup = await prisma.upsertCollectionGroup({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(collectionGroup)
    } catch (e) {
      console.error(e)
    }
  }
}
