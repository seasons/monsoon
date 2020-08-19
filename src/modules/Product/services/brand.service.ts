import * as url from "url"

import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { S3_BASE } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import { BrandWhereUniqueInput, ID_Input } from "@prisma/index"
import { Brand as PrismaBindingBrand } from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"

@Injectable()
export class BrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService
  ) {}

  async createBrand({ input }: { input: any }) {
    let imageIDs
    // Store images and get their record ids to connect to the brand
    if (input.images && input.brandCode) {
      const imageDatas: ImageData[] = await Promise.all(
        input.images.map((image, index) => {
          const imageName = `${input.brandCode}-${index}.png`.toLowerCase()
          return this.imageService.uploadImage(image, {
            imageName,
          })
        })
      )

      const prismaImages = await Promise.all(
        imageDatas.map(async imageData => {
          return await this.prisma.client.upsertImage({
            where: { url: imageData.url },
            create: { ...imageData, title: input.brandCode },
            update: { ...imageData, title: input.brandCode },
          })
        })
      )

      imageIDs = prismaImages.map(image => ({ id: image.id }))
    } else if (input.images && !input.brandCode) {
      throw new ApolloError("To upload brand images please include a brandCode")
    }

    return await this.prisma.client.createBrand({
      ...input,
      images: imageIDs && { connect: imageIDs },
    })
  }

  async updateBrand({
    where,
    data,
  }: {
    where: BrandWhereUniqueInput
    data: any
  }) {
    let imageIDs

    if (data.images) {
      const brand: PrismaBindingBrand = await this.prisma.binding.query.brand(
        { where },
        `{
            id
            slug
            brandCode
        }`
      )
      imageIDs = await this.upsertImages(data.images, brand)
    }

    return await this.prisma.client.updateBrand({
      where,
      data: {
        ...data,
        images: imageIDs && { set: imageIDs },
      },
    })
  }

  /**
   * Upserts images for a given product, uploading new ones to S3 when needed.
   * The [images] argument is either an imageURL or an image file object
   * @param images of type (string | File)[]
   * @param brand: of type Brand as is defined in prisma.binding
   */
  private async upsertImages(
    images: any[],
    brand: PrismaBindingBrand
  ): Promise<{ id: ID_Input }[]> {
    const imageDatas = await Promise.all(
      images.map(async (image, index) => {
        const data = await image
        if (typeof data === "string") {
          // This means that we received an image URL in which case
          // we just have perfom an upsertImage with the url

          // This URL is sent by the client which means it an Imgix URL.
          // Thus, we need to convert it to s3 format and strip any query params as needed.
          const s3BaseURL = S3_BASE.replace(/\/$/, "") // Remove trailing slash
          const s3ImageURL = `${s3BaseURL}${url.parse(data).pathname}`
          const prismaImage = await this.prisma.client.upsertImage({
            create: { url: s3ImageURL, title: brand.slug },
            update: { url: s3ImageURL, title: brand.slug },
            where: { url: s3ImageURL },
          })
          return { id: prismaImage.id }
        } else {
          // This means that we received a new image in the form of
          // a file in which case we have to upload the image to S3
          const imageName = `${brand.brandCode}-${index}.png`.toLowerCase()

          // Upload to S3 and retrieve metadata
          const { height, url, width } = await this.imageService.uploadImage(
            data,
            {
              imageName,
            }
          )
          // Purge this image url in imgix cache
          await this.imageService.purgeS3ImageFromImgix(url)
          // Upsert the image with the s3 image url
          const prismaImage = await this.prisma.client.upsertImage({
            create: { height, url, width, title: brand.slug },
            update: { height, width, title: brand.slug },
            where: { url },
          })
          return { id: prismaImage.id }
        }
      })
    )
    return imageDatas
  }
}
