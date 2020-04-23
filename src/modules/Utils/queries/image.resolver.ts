import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { ImageResizeService } from "../services/imageResize.service"
import { PrismaService } from "@app/prisma/prisma.service"

@Resolver("Image")
export class ImageResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageResizeService: ImageResizeService
  ) {}

  @ResolveField()
  async resized(
    @Parent() image,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("version") version: string
  ) {
    const url = this.imageResizeService.imageResize(image.url, null, {
      w: width,
      h: height,
    })

    return {
      url,
    }
  }
}
