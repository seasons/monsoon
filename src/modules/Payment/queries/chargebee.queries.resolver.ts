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
  async chargebeeCheckout() {
    throw new Error(
      "Chargebee checkout is deprecated, please use processPayment"
    )
  }

  /**
   * Pulls the customer just to ensure they are a customer
   */
  @Query()
  async chargebeeUpdatePaymentPage(@Customer() customer, @User() user) {
    return this.payment.getHostedUpdatePaymentPage(user.id)
  }
}
