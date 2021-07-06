import { ImageService } from "@app/modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import slugify from "slugify"

@Injectable()
export class CollectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService
  ) {}

  async upsertCollection({ data }: { data: any }) {
    let imageIDs
    const images = data.images
    const slug = slugify(data.title)

    if (images) {
      const imageNames = images.map((_image, index) => {
        return slug + "-" + (index + 1)
      })

      imageIDs = await this.imageService.upsertImages(images, imageNames, slug)
    }

    const upsertData = {
      title: data.title,
      subTitle: data.subTitle,
      descriptions: data.descriptions,
      published: data.published,
      displayTextOverlay: data.displayTextOverlay,
      textOverlayColor: data.textOverlayColor,
      placements: data.productIDs && { set: data.placements },
    }

    return this.prisma.client2.collection.upsert({
      where: { id: data.id || "" },
      create: {
        slug,
        ...upsertData,
        images: imageIDs && { connect: imageIDs },
        products: data.productIDs && {
          connect: data.productIDs?.map(id => {
            return { id }
          }),
        },
      },
      update: {
        ...upsertData,
        images: imageIDs && { set: imageIDs },
        products: data.productIDs && {
          set: data.productIDs?.map(id => {
            return { id }
          }),
        },
      },
    })
  }
}
