import { BlogPostCreateInput } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageService } from "@modules/Image/services/image.service"
import { Controller, Post } from "@nestjs/common"
import { pick } from "lodash"

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
    const lastPostStored = await this.prisma.client.blogPosts({
      first: 1,
      orderBy: "webflowCreatedAt_DESC",
    })?.[0]
    if (lastPostPublished.id !== lastPostStored.webflowId) {
      const createData = {
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

      const imageName = `${createData.slug}-image`
      const title = `${createData.name} Image`
      const alt = createData.imageAlt ? createData.imageAlt : title

      const imageData = await this.image.uploadImageFromURL(
        createData.imageURL,
        imageName,
        imageName
      )

      const blogImage = await this.prisma.client.upsertImage({
        where: { url: imageData.url },
        create: { ...imageData, title, alt },
        update: { ...imageData, title, alt },
      })

      await this.prisma.client.createBlogPost({
        ...createData,
        image: {
          connect: { id: blogImage.id },
        },
      })
    }
  }
}
