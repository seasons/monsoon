import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { AuthService } from "@modules/User/services/auth.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class ChargebeeQueriesResolver {
  constructor(
    private readonly payment: PaymentService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly auth: AuthService,
    private readonly segment: SegmentService
  ) {}

  @Query()
  async hostedChargebeeCheckout() {
    throw "Chargebee checkout page is deprecated, please use processPayment"
  }

  @Query()
  async chargebeeGiftCheckout(@Args() { planID }, @Application() application) {
    return await this.payment.getGiftCheckoutPage(planID)
  }

  @Query()
  async gift(@Args() { id }) {
    return await this.payment.getGift(id)
  }

  @Query()
  async chargebeeCheckout(
    @Args() { planID, email: passedEmail, userIDHash, couponID },
    @Application() application
  ) {
    let user

    if (userIDHash) {
      const userID = this.utils.decryptUserIDHash(userIDHash)
      user = await this.prisma.client2.user.findUnique({
        where: { id: userID },
      })
    } else if (passedEmail) {
      user = await this.prisma.client2.user.findUnique({
        where: { email: passedEmail },
      })
    } else {
      throw new Error("Need to pass in either email or userIDHash")
    }

    const { email, firstName, lastName } = user
    const customer = await this.auth.getCustomerFromUserID(user.id)
    const { phoneNumber } = await this.prisma.client
      .customer({ id: customer.id })
      .detail()

    const hostedPage = await this.payment.getHostedCheckoutPage(
      planID,
      user.id,
      email,
      firstName,
      lastName,
      phoneNumber,
      couponID
    )

    const customerWithData = await this.prisma.client2.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        membership: {
          select: { id: true, plan: true },
        },
      },
    })

    const tier = customerWithData?.membership?.plan?.tier

    // Track the selection
    this.segment.track(user.id, "Opened Checkout", {
      email,
      firstName,
      lastName,
      application,
      customerID: customer.id,
      planID,
      tier,
    })

    return hostedPage
  }

  /**
   * Pulls the customer just to ensure they are a customer
   */
  @Query()
  async chargebeeUpdatePaymentPage(@Customer() customer, @User() user) {
    return this.payment.getHostedUpdatePaymentPage(user.id)
  }
}
