import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Plan } from "@app/prisma"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { AuthService } from "@modules/User/services/auth.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

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
  async hostedChargebeeCheckout(
    @Args() { planID },
    @Customer() customer,
    @User() user,
    @Application() application
  ) {
    const { email, firstName, lastName } = user
    const { phoneNumber } = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
    const hostedPage = await this.payment.getHostedCheckoutPage(
      planID,
      user.id,
      email,
      firstName,
      lastName,
      phoneNumber
    )

    const customerWithData = (await this.prisma.binding.query.customer(
      {
        where: { id: customer.id },
      },
      `{
      id
      membership {
        id
        plan {
          id
          tier
        }
      }
    }`
    )) as any

    const tier = customerWithData?.membership?.plan?.tier

    // Track the selection
    this.segment.track(user.id, "Opened Hosted Checkout", {
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

  @Query()
  async chargebeeCheckout(
    @Args() { planID, userIDHash },
    @Application() application
  ) {
    const userID = this.utils.decryptUserIDHash(userIDHash)
    const user = await this.prisma.client.user({ id: userID })
    const { email, firstName, lastName } = user
    const customer = await this.auth.getCustomerFromUserID(userID)
    const { phoneNumber } = await this.prisma.client
      .customer({ id: customer.id })
      .detail()

    const hostedPage = await this.payment.getHostedCheckoutPage(
      planID,
      user.id,
      email,
      firstName,
      lastName,
      phoneNumber
    )

    const customerWithData = (await this.prisma.binding.query.customer(
      {
        where: { id: customer.id },
      },
      `{
      id
      membership {
        id
        plan {
          id
          tier
        }
      }
    }`
    )) as any

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
