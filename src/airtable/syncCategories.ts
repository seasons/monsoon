import { prisma } from "../prisma"
import { getAllCategories } from "./utils"
import slugify from "slugify"

export const syncCategories = async () => {
  const allCategories = await getAllCategories()

  for (let record of allCategories) {
    try {
      const values = record.fields
      const slug = slugify(values.Name)

      const data = {
        slug,
        name: values.Name,
        description: values.Description,
      }

      const category = await prisma.upsertCategory({
        where: {
          name: values.Name,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
        "Seasons ID": category.id,
      })
      console.log(category)
    } catch (e) {
      console.error(e)
    }
  }
}
