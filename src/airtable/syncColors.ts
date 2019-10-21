import slugify from "slugify"
import { prisma } from "../prisma"
import { getAllColors } from "./utils"
import { isEmpty } from "lodash"

export const syncColors = async () => {
  const records = await getAllColors()

  for (let record of records) {
    try {
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

      const color = await prisma.upsertColor({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(color)
    } catch (e) {
      console.error(e)
    }
  }
}
