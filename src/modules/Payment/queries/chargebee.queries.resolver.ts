import { Resolver, Query, Args, Context } from "@nestjs/graphql"
import { Customer, User } from "../../../nest_decorators"
import { PaymentService } from "../services/payment.service"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver()
export class ChargebeeQueriesResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService
  ) {}

  @Query()
  async chargebeeCheckout(
    @Args() { planID },
    @Context() ctx,
    @User() user,
    @Customer() customer
  ) {
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

  /**
   * Pulls the customer just to ensure they are a customer
   */
  @Query()
  async chargebeeUpdatePaymentPage(@Customer() customer, @User() user) {
    return this.paymentService.getHostedUpdatePaymentPage(user.id)
  }
}
