import { prisma } from "../prisma"
import { getAllCategories } from "./utils"
import slugify from "slugify"
import { isEmpty } from "lodash"

export const syncCategories = async () => {
  const allCategories = await getAllCategories()

  for (let record of allCategories) {
    try {
      const { model } = record
      const { name, description } = model

      if (isEmpty(model) || isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()
      const data = {
        slug,
        name,
        description,
      }

      const category = await prisma.upsertCategory({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(category)
    } catch (e) {
      console.error(e)
    }
  }
}
