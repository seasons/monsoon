import { Loader } from "@app/modules/DataLoader"
import { FitPic } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("PublicFitPic")
export class PublicFitPicFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async author(@Parent() fitPic: FitPic) {
    const user = await this.prisma.client.fitPic({ id: fitPic.id }).user()
    return `${user.firstName} ${user.lastName}`
  }
}
