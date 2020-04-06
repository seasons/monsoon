import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class HomepageProductRailQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async homepageProductRails(@Args() args, @Info() info) {
    return await this.prisma.binding.query.homepageProductRails(args, info)
  }

  @Query()
  async homepageProductRail(@Args() args, @Info() info) {
    return await this.prisma.binding.query.homepageProductRail(args, info)
  }
}
