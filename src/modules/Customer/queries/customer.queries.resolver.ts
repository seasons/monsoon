import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@app/prisma/prisma.service"

@Resolver()
export class CustomerQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async customer(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customer(args, info)
  }

  @Query()
  async customers(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customers(args, info)
  }
}
