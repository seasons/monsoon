import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { Prisma } from "@prisma/client"
import { head, pick } from "lodash"

import { AppModule } from "../../app.module"
import { BlogService } from "../../modules/Blog/services/blog.service"
import { ImageService } from "../../modules/Image/services/image.service"
import { QueryUtilsService } from "../../modules/Utils/services/queryUtils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const app = await NestFactory.createApplicationContext(AppModule)
  const blog = app.get(BlogService)
  const image = app.get(ImageService)
  const queryUtils = app.get(QueryUtilsService)

  const lastPostPublished = await blog.getLastPost()

  const lastPostStored = await ps.client.blogPost.findFirst({
    orderBy: {
      webflowCreatedAt: "desc",
    },
  })

  const blogItemWithContent = await blog.getItem(lastPostPublished.id)
  const content = blogItemWithContent["post-content"]

  const blogData = {
    content,
    webflowId: lastPostPublished.id,
    webflowCreatedAt: lastPostPublished.createdAt,
    webflowUpdatedAt: lastPostPublished.updatedAt,
    tags: { set: lastPostPublished.tags ?? [] },
    ...pick(lastPostPublished, [
      "name",
      "body",
      "summary",
      "thumbnailURL",
      "imageURL",
      "imageAlt",
      "url",
      "publishedOn",
      "author",
      "category",
      "slug",
    ]),
  } as Prisma.BlogPostCreateInput

  const imageName = `${blogData.slug}-image-${Date.now()}`
  const title = `${blogData.name} Image`
  const alt = blogData.imageAlt ? blogData.imageAlt : title

  const imageData = await image.uploadImageFromURL(
    blogData.imageURL,
    imageName,
    imageName
  )

  const blogImage = await ps.client.image.upsert({
    where: { url: imageData.url },
    create: { ...imageData, title, alt },
    update: { ...imageData, title, alt },
  })

  if (lastPostPublished.id !== lastPostStored.webflowId) {
    await ps.client.blogPost.create({
      data: {
        ...queryUtils.prismaOneToPrismaTwoMutateData(blogData, "BlogPost"),
        image: {
          connect: { id: blogImage.id },
        },
      },
    })
  } else if (lastPostPublished.id === lastPostStored.webflowId) {
    await ps.client.blogPost.update({
      where: { id: lastPostStored.id },
      data: {
        ...queryUtils.prismaOneToPrismaTwoMutateData(blogData, "BlogPost"),
        image: {
          connect: { id: blogImage.id },
        },
      },
    })
  }
}

run()
