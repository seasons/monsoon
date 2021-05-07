import { BlogPostCreateInput } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageService } from "@modules/Image/services/image.service"
import { Controller, Post } from "@nestjs/common"
import { head, pick } from "lodash"

import { BlogService } from "../services/blog.service"

@Controller("webflow_events")
export class WebflowController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blog: BlogService,
    private readonly image: ImageService
  ) {}

  @Post()
  async handlePost() {
    const lastPostPublished = await this.blog.getLastPost()
    const firstBlogPosts = await this.prisma.client.blogPosts({
      first: 1,
      orderBy: "webflowCreatedAt_DESC",
    })

    const lastPostStored = head(firstBlogPosts) as any
    const blogItemWithContent = await this.blog.getItem(lastPostPublished.id)
    const content = blogItemWithContent["post-content"]

    const blogData = {
      content,
      webflowId: lastPostPublished.id,
      webflowCreatedAt: lastPostPublished.createdAt,
      webflowUpdatedAt: lastPostPublished.updatedAt,
      tags: { set: lastPostPublished.tags },
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
    } as BlogPostCreateInput

    const imageName = `${blogData.slug}-image`
    const title = `${blogData.name} Image`
    const alt = blogData.imageAlt ? blogData.imageAlt : title

    const imageData = await this.image.uploadImageFromURL(
      blogData.imageURL,
      imageName,
      imageName
    )

    const blogImage = await this.prisma.client.upsertImage({
      where: { url: imageData.url },
      create: { ...imageData, title, alt },
      update: { ...imageData, title, alt },
    })

    if (lastPostPublished.id !== lastPostStored.webflowId) {
      await this.prisma.client.createBlogPost({
        ...blogData,
        image: {
          connect: { id: blogImage.id },
        },
      })
    } else if (lastPostPublished.id === lastPostStored.webflowId) {
      await this.prisma.client.updateBlogPost({
        where: { id: lastPostStored.id },
        data: {
          ...blogData,
          image: {
            connect: { id: blogImage.id },
          },
        },
      })
    }
  }
}
