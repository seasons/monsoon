import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class LaunchQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async launch(@Args() args, @Info() info) {
    return await this.prisma.binding.query.launch(args, info)
  }

  @Query()
  async launches(@Args() args, @Info() info) {
    let _args = args
    if (args.upcoming) {
      _args = {
        ...args,
        where: {
          AND: [
            {
              launchAt_gte: new Date(Date.now()).toISOString(),
            },
            {
              published: true,
            },
          ],
        },
      }
    }
    return await this.prisma.binding.query.launches(_args, info)
  }

  @Query()
  async launchesConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.launchesConnection(args, info)
  }
}
