import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@modules/Prisma/prisma.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
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
    const _data = await this.prisma.client2.paymentPlan.findMany({
      ...args,
      where: { ...args.where, status: "active" },
    })

    return this.prisma.sanitizePayload(_data, "PaymentPlan")
  }

  @Query()
  async paymentPlan(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on PaymentPlan { id planID }`,
    })
    select
  ) {
    const _data = await this.prisma.client2.paymentPlan.findFirst({
      where: { ...args.where, status: "active" },
      select,
    })

    return this.prisma.sanitizePayload(_data, "PaymentPlan")
  }
}
