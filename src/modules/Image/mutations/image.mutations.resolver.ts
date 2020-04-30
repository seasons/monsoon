import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import AWS from "aws-sdk"

import { ImageService } from "../services/image.service"

@Resolver()
export class ImageMutationsResolver {
  private s3 = new AWS.S3()

  constructor(private readonly imageService: ImageService) {}

  @Mutation()
  async uploadImage(@Args("image") image) {
    return await this.imageService.uploadImage(image)
  }
}
