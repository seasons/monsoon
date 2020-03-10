import slugify from "slugify"
import { prisma } from "../../prisma"
import { isEmpty } from "lodash"
import { getAllCollections, getAllCollectionGroups } from "../utils"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncCollectionGroups = async (cliProgressBar?) => {
  const records = await getAllCollectionGroups()
  const allCollections = await getAllCollections()

  const [
    multibar,
    _cliProgressBar,
  ] = makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: records.length,
    modelName: "Collection Groups",
  })

  for (const record of records) {
    _cliProgressBar.increment()

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

      await prisma.upsertCollectionGroup({
        where: {
          slug,
        },
        create: data,
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
