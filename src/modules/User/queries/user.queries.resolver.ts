import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class UserQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async user(@Args() args, @Info() info) {
    return await this.prisma.binding.query.user(args, info)
  }

  @Query()
  async users(@Args() args, @Info() info) {
    return await this.prisma.binding.query.users(args, info)
  }

  @Query()
  async usersConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.usersConnection(args, info)
  }
}
