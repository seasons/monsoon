import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import AWS from "aws-sdk"

@Resolver()
export class ImageMutationsResolver {
  private s3 = new AWS.S3()

  @Mutation()
  async uploadImage(@Args("image") image) {
    console.log("Hello file", image)

    const file = await image
    const { createReadStream, filename, mimetype } = file
    const fileStream = createReadStream()

    // Here stream it to S3
    // Enter your bucket name here next to "Bucket: "
    const uploadParams = {
      Bucket: "seasons-images",
      Key: filename,
      Body: fileStream,
    }
    const result = await this.s3.upload(uploadParams).promise()

    console.log(result)
    return result.Location
  }
}
