import { prisma } from "../prisma"
import { getAllColors } from "./utils"

export const syncColors = async () => {
  const records = await getAllColors()

  for (let record of records) {
    try {
      const values = record.fields
      const seasonsID = values["Seasons ID"]

      const data = {
        colorCode: values["Color Code"],
        hexCode: values.RGB,
        name: values.Name,
      }

      const color = !!seasonsID
        ? await prisma.upsertColor({
            where: {
              id: seasonsID,
            },
            create: data,
            update: data,
          })
        : await prisma.createColor(data)

      await record.patchUpdate({
        "Seasons ID": color.id,
      })

      console.log(color)
    } catch (e) {
      console.error(e)
    }
  }
}
