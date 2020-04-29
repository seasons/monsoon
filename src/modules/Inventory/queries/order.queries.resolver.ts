import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class OrderQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async user(@Args() args, @Info() info) {
    return await this.prisma.binding.query.order(args, info)
  }

  @Query()
  async orders(@Args() args, @Info() info) {
    return await this.prisma.binding.query.orders(args, info)
  }
}
