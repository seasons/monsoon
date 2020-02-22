import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { PrismaService } from "../../prisma/prisma.service"

@Resolver("HomepageProductRail")
export class HomepageProductRailResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async homepageProductRails(@Args() args, @Info() info) {
    return await this.prisma.query.homepageProductRails(args, info)
  }

  @Query()
  async homepageProductRail(@Args() args, @Info() info) {
    return await this.prisma.query.homepageProductRail(args, info)
  }
}
