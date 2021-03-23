import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class LaunchQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async launch(@Args() args, @Info() info) {
    return await this.prisma.binding.query.launch(args, info)
  }

  @Query()
  async launches(@Args() args, @Info() info) {
    return this.prisma.binding.query.launches(args, info)
  }

  @Query()
  async launchesConnection(@Args() args, @Info() info) {
    return this.prisma.binding.query.launchesConnection(args, info)
  }
}
