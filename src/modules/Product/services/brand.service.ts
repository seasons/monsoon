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

    const brand: PrismaBindingBrand = await this.prisma.binding.query.brand(
      { where },
      `{
          id
          slug
          brandCode
          externalShopifyIntegration {
            id
          }
      }`
    )

    if (data.images) {
      const images = data.images

      const imageNames = images.map((_image, index) => {
        return `${brand.brandCode}-${index + 1}.png`.toLowerCase()
      })

      imageIDs = await this.imageService.upsertImages(
        images,
        imageNames,
        data.slug
      )
    }

    if (data.externalShopifyIntegration) {
      data.externalShopifyIntegration = {
        upsert: {
          update: data.externalShopifyIntegration,
          create: data.externalShopifyIntegration,
        },
      }
    } else if (brand?.externalShopifyIntegration?.id) {
      data.externalShopifyIntegration = { delete: true }
    }

    return await this.prisma.client.updateBrand({
      where,
      data: {
        ...data,
        images: imageIDs && { set: imageIDs },
      },
    })
  }
}
