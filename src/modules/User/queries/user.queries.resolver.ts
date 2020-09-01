import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { addFragmentToInfo } from "graphql-binding"
import { zip } from "lodash"

@Resolver()
export class UserQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async user(@Args() args, @Info() info) {
    return await this.prisma.binding.query.user(
      args,
      addFragmentToInfo(info, `fragment EnsureId on User {id}`)
    )
  }

  @Query()
  async users(@Args() args, @Info() info) {
    return await this.prisma.binding.query.users(
      args,
      addFragmentToInfo(info, `fragment EnsureId on User {id}`)
    )
  }

  @Query()
  async usersConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.usersConnection(args, info)
  }

  @Query()
  async zipcodeServiced(@Args() args, @Info() info) {
    return await this.prisma.binding.query.zipcodeServiced(args, info)
  }
}
