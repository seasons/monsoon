import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class LaunchQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async launch(@Args() args, @Select({}) select) {
    const data = await this.prisma.client2.launch.findUnique({
      ...select,
      ...args,
    })

    const sanitizedData = this.prisma.sanitizePayload(data, "Launch")

    return sanitizedData
  }

  @Query()
  async launches(
    @FindManyArgs({
      transformArgs: args => {
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

        return _args
      },
    })
    args,
    @Select({}) select
  ) {
    const data = await this.prisma.client2.launch.findMany({
      ...args,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "Launch")

    return sanitizedData
  }

  @Query()
  async launchesConnection(
    @Args() args,
    @FindManyArgs({}) { where, orderBy },
    @Select({}) select
  ) {
    // TODO: Need to sanitize the edges
    const result = await findManyCursorConnection(
      args =>
        this.prisma.client2.launch.findMany({
          ...args,
          ...select,
          where,
          orderBy,
        }),
      () => this.prisma.client2.launch.count({ where }),
      { ...args }
    )
    const sanitizedResult = this.prisma.sanitizeConnection(result)
    return sanitizedResult
  }
}
