import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { ImageService } from "../services/image.service"

@Resolver("Image")
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @ResolveField()
  async resized(
    @Parent() image,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("version") version: string
  ) {
    const url = await this.imageService.resizeImage(image.url, null, {
      w: width,
      h: height,
    })

    return url
  }
}
