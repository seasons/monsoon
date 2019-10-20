import slugify from "slugify"
import { prisma, LocationCreateInput } from "../prisma"
import { getAllLocations, airtableToPrismaObject } from "./utils"
import omit from "lodash/omit"

export const syncLocations = async () => {
  const allLocations = await getAllLocations()

  for (let record of allLocations) {
    try {
      let values = omit(airtableToPrismaObject(record.fields), [
        "physicalProducts",
        "createdAt",
        "updatedAt",
      ]) as LocationCreateInput

      values = {
        ...values,
        slug: slugify(values.name),
      }

      const location = await prisma.upsertLocation({
        where: {
          name: values.name,
        },
        create: values,
        update: values,
      })

      await record.patchUpdate({
        "Seasons ID": location.id,
        Slug: values.slug,
      })

      console.log(location)
    } catch (e) {
      console.error(e)
    }
  }
}
