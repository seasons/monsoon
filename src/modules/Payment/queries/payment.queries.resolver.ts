import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
@Resolver()
export class PaymentQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async paymentPlans(
    @FindManyArgs({
      withFragment: `fragment EnsureId on PaymentPlan { id planID }`,
    })
    args
  ) {
    return await this.prisma.client.paymentPlan.findMany({
      ...args,
      where: { ...args.where, status: "active" },
    })
  }

  @Query()
  async paymentPlan(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on PaymentPlan { id planID }`,
    })
    select
  ) {
    return await this.prisma.client.paymentPlan.findFirst({
      where: { ...args.where, status: "active" },
      select,
    })
  }
}
