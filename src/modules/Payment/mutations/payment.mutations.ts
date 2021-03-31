import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { UpdatePaymentService } from "@modules/Payment/services/updatePayment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

@Resolver()
export class PaymentMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly updatePaymentService: UpdatePaymentService,
    private readonly segment: SegmentService,
    private readonly email: EmailService,
    private readonly paymentUtils: PaymentUtilsService
  ) {}

  @Mutation()
  async processPayment(
    @Args() { planID, paymentMethodID, couponID, billing },
    @Customer() customer,
    @Application() application
  ) {
    return this.paymentService.processPayment(
      planID,
      paymentMethodID,
      couponID,
      billing,
      customer,
      application
    )
  }

  /**
   * This method is used for both credit card and apple pay checkouts.
   * Currently only used in harvest
   * @param param0
   * @param customer
   */
  @Mutation()
  async applePayCheckout(
    @Args() { planID, token, tokenType, couponID },
    @Customer() customer,
    @Application() application
  ) {
    await this.paymentService.stripeTokenCheckout(
      planID,
      token,
      customer,
      tokenType,
      couponID,
      application
    )
    return true
  }

  @Mutation()
  async updatePaymentMethod(
    @Args() { planID, paymentMethodID, billing },
    @Customer() customer
  ) {
    await this.updatePaymentService.updatePaymentMethod(
      planID,
      customer,
      null,
      null,
      paymentMethodID,
      billing
    )
    return true
  }

  /**
   * applePayUpdatePaymentMethod is deprecated, use updatePaymentMethod
   */
  @Mutation()
  async applePayUpdatePaymentMethod(
    @Args() { planID, token, tokenType },
    @Customer() customer
  ) {
    await this.updatePaymentService.updatePaymentMethod(
      planID,
      customer,
      token,
      tokenType,
      null,
      null
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
    @Args() { subscriptionID, pauseType },
    @Customer() customer,
    @User() user
  ) {
    await this.paymentService.pauseSubscription(
      subscriptionID,
      customer,
      pauseType
    )
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
          itemCount
        }
        pauseRequests {
          createdAt
          resumeDate
          pauseDate
          pauseType
        }
      }
      reservations {
        id
        status
        createdAt
      }
    }`
    )) as any
    await this.email.sendPausedEmail(customerWithData, false)

    const tier = customerWithData?.membership?.plan?.tier
    const planID = customerWithData?.membership?.plan?.planID

    this.segment.track(user.id, "Paused Subscription", {
      ...pick(user, ["firstName", "lastName", "email"]),
      planID,
      tier,
      pauseType,
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
    return await this.updatePaymentService.updatePaymentAndShipping(
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
