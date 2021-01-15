import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { FitPic } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageOptions, ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("FitPic")
export class FitPicFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService
  ) {}

  @ResolveField()
  async customer(
    @Parent() fitpic: FitPic,
    @Info() info: any,
    @Loader({
      params: {
        query: "fitPics",
        info: "{ id user { id } }",
      },
    })
    userLoader: PrismaDataLoader<any>
  ) {
    const fp = await userLoader.load(fitpic.id)
    const customerArray = await this.prisma.binding.query.customers(
      {
        where: { user: { id: fp.user.id } },
      },
      info
    )
    return customerArray.length > 0 ? customerArray[0] : null
  }

  @ResolveField()
  async author(
    @Parent() fitPic: FitPic,
    @Loader({
      params: {
        query: "fitPics",
        info: "{ id user { firstName lastName } }",
        formatData: rec => `${rec.user.firstName} ${rec.user.lastName}`,
      },
    })
    authorLoader: PrismaDataLoader<any>
  ) {
    if (!fitPic) {
      return ""
    }
    return authorLoader.load(fitPic.id)
  }

  @ResolveField()
  async image(
    @Parent() parent,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("size") size: ImageSize = "Medium",
    @Args("options") options: ImageOptions
  ) {
    const image = parent.image
    const url = await this.imageService.resizeImage(image?.url, size, {
      ...options,
      w: width,
      h: height,
      updatedAt: image.updatedAt as string,
    })

    return {
      id: image?.id,
      url,
    }
  }
}
