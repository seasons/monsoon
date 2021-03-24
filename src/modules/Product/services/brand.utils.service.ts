import { ImageService } from "@modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"

@Injectable()
export class BrandUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService
  ) {}

  async createBrandImages(data: any) {
    let imageIDs
    let logoID
    if (data.images && data.brandCode) {
      const images = data.images

      const imageNames = images.map((_image, index) => {
        return `${data.brandCode}-${index + 1}.png`.toLowerCase()
      })

      imageIDs = await this.imageService.upsertImages(
        images,
        imageNames,
        data.slug
      )
    } else if (data.images && !data.brandCode) {
      throw new ApolloError("To upload brand images please include a brandCode")
    }

    if (data.logo && data.brandCode) {
      const imageName = `${data.brandCode}-logo.png`.toLowerCase()
      const imageData = await this.imageService.uploadImage(data.logo, {
        imageName,
      })

      const title = `${data.brandCode} Logo`

      const logo = await this.prisma.client.upsertImage({
        where: { url: imageData.url },
        create: { ...imageData, title },
        update: { ...imageData, title },
      })

      logoID = logo.id
    } else if (data.logo && !data.brandCode) {
      throw new ApolloError("To upload brand logo please include a brandCode")
    }

    return { logoID, imageIDs }
  }
}
