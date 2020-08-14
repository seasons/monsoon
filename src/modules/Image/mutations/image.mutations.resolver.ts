import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { ImageService } from "../services/image.service"

@Resolver()
export class ImageMutationsResolver {
  constructor(private readonly imageService: ImageService) {}

  @Mutation()
  async uploadImage(@Args("image") image) {
    const { url } = await this.imageService.uploadImage(image, {})
    return url
  }
}
