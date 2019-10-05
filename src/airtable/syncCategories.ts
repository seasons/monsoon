import { base } from "./config"
import { prisma } from "../prisma"

export const syncCategories = () => {
  return base("Categories")
    .select({
      view: "Grid view",
    })
    .eachPage(
      (records, fetchNextPage) => {
        records.forEach(async function(record) {
          try {
            const values = record.fields
            console.log("Retrieved", JSON.stringify(record.fields, null, 2))

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

            record
              .patchUpdate({
                "Seasons ID": category.id,
              })
              .catch(console.error)
          } catch (e) {
            console.error(e)
          }
        })

        return fetchNextPage()
      },
      err => {
        console.error(err)
        return
      }
    )
}

syncCategories()
