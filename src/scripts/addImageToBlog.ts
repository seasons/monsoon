import "module-alias/register"

import { ImageService } from "../modules/Image/services/image.service"
import { PrismaService } from "../prisma/prisma.service"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

let count = 1

const add = async () => {
  const ps = new PrismaService()
  const imageService = new ImageService(ps)

  const blogPosts = await ps.client.blogPosts()

  for (const blogPost of blogPosts) {
    if (!blogPost) {
      return
    }

    const imageName = `${blogPost.slug}-image`
    const title = `${blogPost.slug} Image`
    const alt = blogPost.imageAlt

    const imageData = await imageService.uploadImageFromURL(
      blogPost.imageURL,
      imageName,
      title
    )

    const blogImage = await ps.client.upsertImage({
      where: { url: imageData.url },
      create: { ...imageData, title, alt },
      update: { ...imageData, title, alt },
    })

    await ps.client.updateBlogPost({
      where: { id: blogPost.id },
      data: {
        image: { connect: { id: blogImage.id } },
      },
    })

    console.log(`Updates ${count} of ${blogPosts.length}`)
    count++
  }
}

add()
