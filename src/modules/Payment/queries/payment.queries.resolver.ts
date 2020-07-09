import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class PaymentQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async paymentPlans(@Args() args, @Info() info) {
    return await this.prisma.binding.query.paymentPlans(args, info)
  }
}
