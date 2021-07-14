import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"

import { CustomBrandCreateOrUpdateData } from "../product.types"

@Injectable()
export class BrandUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService
  ) {}

  async getCreateBrandImagesPromises(data: CustomBrandCreateOrUpdateData) {
    let imageDatas
    let logoData

    const promises = []

    if (data.images && data.brandCode) {
      const images = data.images

      const imageNames = images.map((_image, index) => {
        return `${data.brandCode}-${index + 1}.png`.toLowerCase()
      })

      imageDatas = await this.imageService.upsertImages(
        images,
        imageNames,
        data.slug,
        true
      )
    } else if (data.images && !data.brandCode) {
      throw new ApolloError("To upload brand images please include a brandCode")
    }

    if (
      data.logoImage &&
      typeof (await data.logoImage) !== "string" &&
      data.brandCode
    ) {
      const imageName = `${data.brandCode}-logo.png`.toLowerCase()
      const imageData = await this.imageService.uploadImage(
        Promise.resolve(data.logoImage),
        {
          imageName,
        }
      )

      const title = `${data.brandCode} Logo`

      logoData = {
        promise: this.prisma.client2.image.upsert({
          where: { url: imageData.url },
          create: { ...imageData, title },
          update: { ...imageData, title },
        }),
        url: imageData.url,
      }
    } else if (data.logoImage && !data.brandCode) {
      throw new ApolloError("To upload brand logo please include a brandCode")
    }

    return { logoData, imageDatas }
  }
}
