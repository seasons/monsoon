import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { addFragmentToInfo } from "graphql-binding"
@Resolver()
export class PaymentQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async paymentPlans(@Args() args, @Info() info) {
    return await this.prisma.binding.query.paymentPlans(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on PaymentPlan { id planID }`
      )
    )
  }

  @Query()
  async paymentPlan(@Args() args, @Info() info) {
    return await this.prisma.binding.query.paymentPlan(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on PaymentPlan { id planID }`
      )
    )
  }
}
