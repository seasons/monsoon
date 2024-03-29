import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageService } from "@modules/Image/services/image.service"
import { Controller, Post } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { pick } from "lodash"

import { BlogService } from "../services/blog.service"

@Controller("webflow_events")
export class WebflowController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blog: BlogService,
    private readonly image: ImageService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Post()
  async handlePost() {
    const lastPostPublished = await this.blog.getLastPost()

    const lastPostStored = await this.prisma.client.blogPost.findFirst({
      orderBy: {
        webflowCreatedAt: "desc",
      },
    })

    const blogItemWithContent = await this.blog.getItem(lastPostPublished.id)
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

    const imageData = await this.image.uploadImageFromURL(
      blogData.imageURL,
      imageName,
      imageName
    )

    const blogImage = await this.prisma.client.image.upsert({
      where: { url: imageData.url },
      create: { ...imageData, title, alt },
      update: { ...imageData, title, alt },
    })

    if (lastPostPublished.id !== lastPostStored.webflowId) {
      await this.prisma.client.blogPost.create({
        data: {
          ...this.queryUtils.prismaOneToPrismaTwoMutateData(
            blogData,
            "BlogPost"
          ),
          image: {
            connect: { id: blogImage.id },
          },
        },
      })
    } else if (lastPostPublished.id === lastPostStored.webflowId) {
      await this.prisma.client.blogPost.update({
        where: { id: lastPostStored.id },
        data: {
          ...this.queryUtils.prismaOneToPrismaTwoMutateData(
            blogData,
            "BlogPost"
          ),
          image: {
            connect: { id: blogImage.id },
          },
        },
      })
    }
  }
}
