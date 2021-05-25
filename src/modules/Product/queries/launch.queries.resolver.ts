import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class LaunchQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

  @Query()
  async launch(@Args() { where }, @Select({}) select) {
    return this.queryUtils.resolveFindUnique({ where, select }, "Launch")
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
    return this.queryUtils.resolveFindMany({ ...args, select }, "Launch")
  }

  @Query()
  async launchesConnection(@Args() args, @Select({}) select) {
    return this.queryUtils.resolveConnection({ ...args, select }, "Launch")
  }
}
