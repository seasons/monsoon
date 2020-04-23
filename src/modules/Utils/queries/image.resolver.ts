import { Parent, ResolveField, Resolver, Args } from "@nestjs/graphql"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageResizeService } from "../services/imageResize.service"

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
