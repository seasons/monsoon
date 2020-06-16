import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const updateImageURLs = async () => {
  const ps = new PrismaService()

  const images = await ps.binding.query.images({})
  for (const image of images) {
    const newURL = image.url.replace(
      "seasons-images.",
      "seasons-images-staging."
    )

    await ps.client.updateImage({
      where: { id: image.id },
      data: { url: newURL },
    })

    console.log("Old URL: ", image.url, "\nNew URL: ", newURL)
  }
}

updateImageURLs()
