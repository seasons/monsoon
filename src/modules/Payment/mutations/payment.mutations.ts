import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

@Resolver()
export class PaymentMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly segment: SegmentService,
    private readonly email: EmailService,
    private readonly paymentUtils: PaymentUtilsService
  ) {}

  @Mutation()
  async applePayCheckout(
    @Args() { planID, token, tokenType, couponID },
    @Customer() customer
  ) {
    await this.paymentService.stripeTokenCheckout(
      planID,
      token,
      customer,
      tokenType,
      couponID
    )
    return true
  }

  @Mutation()
  async applePayUpdatePaymentMethod(
    @Args() { planID, token, tokenType },
    @Customer() customer
  ) {
    await this.paymentService.updatePaymentMethodWithStripeToken(
      planID,
      token,
      customer,
      tokenType
    )
    return true
  }

  @Mutation()
  async changeCustomerPlan(@Args() { planID }, @Customer() customer) {
    await this.paymentService.changeCustomerPlan(planID, customer)
    return true
  }

  @Mutation()
  async updateResumeDate(@Args() { date }, @Customer() customer) {
    await this.paymentUtils.updateResumeDate(date, customer)
    return true
  }

  @Mutation()
  async pauseSubscription(
    @Args() { subscriptionID },
    @Customer() customer,
    @User() user
  ) {
    await this.paymentService.pauseSubscription(subscriptionID, customer)
    const customerWithData = (await this.prisma.binding.query.customer(
      {
        where: { id: customer.id },
      },
      `{
      id
      user {
        firstName
        email
        id
      }
      membership {
        id
        plan {
          id
          tier
          planID
        }
        pauseRequests {
          createdAt
          resumeDate
        }
      }
    }`
    )) as any
    await this.email.sendPausedEmail(customerWithData)

    const tier = customerWithData?.membership?.plan?.tier
    const planID = customerWithData?.membership?.plan?.planID

    this.segment.track(user.id, "Paused Subscription", {
      ...pick(user, ["firstName", "lastName", "email"]),
      planID,
      tier,
    })

    return true
  }

  @Mutation()
  async resumeSubscription(
    @Args() { subscriptionID, date },
    @Customer() customer
  ) {
    await this.paymentUtils.resumeSubscription(subscriptionID, date, customer)
    return true
  }

  @Mutation()
  async removeScheduledPause(@Args() { subscriptionID }, @Customer() customer) {
    await this.paymentService.removeScheduledPause(subscriptionID, customer)
    return true
  }

  @Mutation()
  async updatePaymentAndShipping(
    @Args() { billingAddress, phoneNumber, shippingAddress },
    @Customer() customer,
    @User() user
  ) {
    return await this.paymentService.updatePaymentAndShipping(
      billingAddress,
      phoneNumber,
      shippingAddress,
      customer,
      user
    )
  }

  @Mutation()
  async refundInvoice(@Args() { input: args }) {
    return await this.paymentService.refundInvoice(args)
  }

  @Mutation()
  async checkCoupon(@Args() { couponID }) {
    return await this.paymentService.checkCoupon(couponID)
  }
}
