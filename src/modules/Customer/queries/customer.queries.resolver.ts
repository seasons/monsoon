import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class CustomerQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async customer(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on Customer {id}`,
    })
    select
  ) {
    const _data = await this.prisma.client2.customer.findUnique({
      where: { ...args.where },
      select,
    })
    return this.prisma.sanitizePayload(_data, "Customer")
  }

  @Query()
  async customers(
    @FindManyArgs({
      withFragment: `fragment EnsureId on Customer {id}`,
    })
    findManyArgs
  ) {
    const _data = await this.prisma.client2.customer.findMany({
      ...findManyArgs,
    })
    return this.prisma.sanitizePayload(_data, "Customer")
  }

  @Query()
  async customersConnection(@Args() args, @Select() select) {
    return await this.queryUtils.resolveConnection(
      { ...args, select },
      "Customer"
    )
  }

  @Query()
  async pauseReason(@Args() { where }, @Select() select) {
    return await this.queryUtils.resolveFindUnique(
      { where, select },
      "PauseReason"
    )
  }

  @Query()
  async pauseReasons(@FindManyArgs() args) {
    return await this.queryUtils.resolveFindMany(args, "PauseReason")
  }
}
