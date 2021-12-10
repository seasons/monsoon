import "module-alias/register"

import cuid from "cuid"
import slugify from "slugify"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const locations = await ps.client.location.findMany({
    where: {
      slug: null,
    },
  })
  for (let location of locations) {
    try {
      if (!location.slug) {
        const updatedSlug =
          location.name !== null
            ? slugify(location.name + " location").toLowerCase()
            : cuid()

        console.log("Updated slug: ", updatedSlug)
        await ps.client.location.update({
          where: {
            id: location.id,
          },
          data: {
            slug: updatedSlug.toLowerCase(),
          },
        })
      }
    } catch (e) {
      console.error(e)
    }
  }
}
run()
