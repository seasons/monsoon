import slugify from "slugify"
import { prisma } from "../../prisma"
import { getAllColors } from "../utils"
import { isEmpty } from "lodash"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncColors = async (cliProgressBar?) => {
  const records = await getAllColors()

  const [
    multibar,
    _cliProgressBar,
  ] = await makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: records.length,
    modelName: "Colors",
  })

  for (const record of records) {
    try {
      _cliProgressBar.increment()

      const { model } = record
      const { name, colorCode, rGB } = model

      if (isEmpty(model) || isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()

      const data = {
        colorCode,
        hexCode: rGB,
        name,
        slug,
      }

      await prisma.upsertColor({
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
