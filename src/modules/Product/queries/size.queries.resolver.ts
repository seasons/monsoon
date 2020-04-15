import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class SizeQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async bottomSize(@Args() args, @Info() info) {
    return await this.prisma.binding.query.bottomSize(args, info)
  }

  @Query()
  async bottomSizes(@Args() args, @Info() info) {
    return await this.prisma.binding.query.bottomSizes(args, info)
  }

  @Query()
  async topSize(@Args() args, @Info() info) {
    return await this.prisma.binding.query.topSize(args, info)
  }

  @Query()
  async topSizes(@Args() args, @Info() info) {
    return await this.prisma.binding.query.topSizes(args, info)
  }

  @Query()
  async size(@Args() args, @Info() info) {
    return await this.prisma.binding.query.size(args, info)
  }

  @Query()
  async sizes(@Args() args, @Info() info) {
    return await this.prisma.binding.query.sizes(args, info)
  }

  @Query()
  async sizesConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.sizesConnection(args, info)
  }
}
