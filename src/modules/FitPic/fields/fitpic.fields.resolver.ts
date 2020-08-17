import { Loader } from "@app/modules/DataLoader"
import { FitPic } from "@app/prisma"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("FitPic")
export class FitPicFieldsResolver {
  @ResolveField()
  async author(
    @Parent() fitPic: FitPic,
    @Loader({
      type: PrismaLoader.name,
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
}
