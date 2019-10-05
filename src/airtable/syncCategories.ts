import { prisma } from "../prisma"
import { getAllCategories } from "./utils"

export const syncCategories = async () => {
  const allCategories = await getAllCategories()

  for (let record of allCategories) {
    try {
      const values = record.fields

      const data = {
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
        "Seasons ID": category.id,
      })
      console.log(category)
    } catch (e) {
      console.error(e)
    }
  }
}
