import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { AuthService } from "@modules/User/services/auth.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class ChargebeeQueriesResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly authService: AuthService,
    private readonly segment: SegmentService
  ) {}

  @Query()
  async hostedChargebeeCheckout(
    @Args() { planID },
    @Customer() customer,
    @User() user
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
    this.segment.client.track({
      userId: user.id,
      event: "Opened Hosted Checkout",
      properties: {
        customerID: customer.id,
        email,
        firstName,
        lastName,
        plan: planID,
      },
    })

    return hostedPage
  }

  @Query()
  async chargebeeCheckout(@Args() { planID, userIDHash }) {
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
    this.segment.client.track({
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
