import slugify from "slugify"
import { prisma, LocationCreateInput } from "../prisma"
import { getAllLocations } from "./utils"
import omit from "lodash/omit"
import { isEmpty } from "lodash"

export const syncLocations = async () => {
  const allLocations = await getAllLocations()

  for (let record of allLocations) {
    try {
      const { model } = record
      const { name } = model
      if (isEmpty(model) || isEmpty(name)) {
        continue
      }

      let values = omit(model, [
        "physicalProducts",
        "createdAt",
        "updatedAt",
        "recordID",
        "reservations",
        "reservations2",
        "reservations3",
        "users",
        "users2",
      ]) as LocationCreateInput

      values = {
        ...values,
        slug: slugify(values.name + Date.now() / 1000).toLowerCase(),
      }

      const location = await prisma.upsertLocation({
        where: {
          slug: values.slug,
        },
        create: values,
        update: values,
      })

      await record.patchUpdate({
        Slug: values.slug,
      })
    } catch (e) {
      console.error(e)
    }
  }
}
