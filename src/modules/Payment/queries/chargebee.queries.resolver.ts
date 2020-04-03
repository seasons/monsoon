import { Resolver, Query, Args, Context } from "@nestjs/graphql"
import { Customer, User } from "../../../nest_decorators"
import { PaymentService } from "../services/payment.service"
import { PrismaService } from "../../../prisma/prisma.service"
import { UtilsService } from "../../Utils/utils.service"
import { AuthService } from "../../User/services/auth.service"

@Resolver()
export class ChargebeeQueriesResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly authService: AuthService
  ) {}

  @Query()
  async chargebeeCheckout(@Args() { planID, userIDHash }, @Context() ctx) {
    const userID = this.utils.decryptUserIDHash(userIDHash)
    const user = await this.prisma.client.user({ id: userID })
    const { email, firstName, lastName } = user
    const customer = await this.authService.getCustomerFromUserID(userID)
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
