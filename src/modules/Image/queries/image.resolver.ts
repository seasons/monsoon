import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { ImageService } from "../services/image.service"

@Resolver("Image")
export class ImageResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService
  ) {}

  @ResolveField()
  async resized(
    @Parent() image,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("version") version: string
  ) {
    const url = this.imageService.resizeImage(image.url, null, {
      w: width,
      h: height,
      updatedAt: image.updatedAt,
    })

    return {
      url,
    }
  }
}
