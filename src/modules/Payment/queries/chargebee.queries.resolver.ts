import { Resolver, Query, Args, Context } from "@nestjs/graphql"
import { PrismaClientService } from "../../../prisma/client.service"
import { Customer, User } from "../../../nest_decorators"
import { PaymentService } from "../services/payment.services"

@Resolver()
export class ChargebeeQueriesResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaClientService
  ) {}

  @Query()
  async chargebeeCheckout(@Args() { planID }, @Context() ctx, @User() user, @Customer() customer) {
    const { email, firstName, lastName } = user
    const { phoneNumber } = await this.prisma.client
      .customer({ id: customer.id })
      .detail()

    const hostedPage = await this.paymentService.getHostedCheckoutPage(
      planID,
      user.id,
      email,
      firstName,
      lastName,
      phoneNumber
    )

    // Track the selection
    ctx.analytics.track({
      userId: user.id,
      event: "Opened Checkout",
      properties: {
        plan: planID,
      },
    })

    return hostedPage
  }
}