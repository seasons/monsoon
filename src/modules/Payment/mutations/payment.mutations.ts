import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import chargebee from "chargebee"
import { pick } from "lodash"
import Stripe from "stripe"

const stripe = new Stripe("sk_test_q3thv8dB2JZ1FAUbzdQqmO3G0022ZvQ5w4", {
  apiVersion: "2020-08-27",
})

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
  async processPayment(
    @Args() { planID, paymentMethodID, billing },
    @User() user
  ) {
    const billingAddress = {
      first_name: billing.user.firstName || "",
      last_name: billing.user.lastName || "",
      ...billing.address,
      zip: billing.address.postal_code || "",
      country: "US", // assume its US for now, because we need it for taxes.
    }

    const subscriptionEstimate = await chargebee.estimate
      .create_subscription({
        billing_address: billingAddress,
        subscription: {
          plan_id: planID,
        },
      })
      .request()

    const intent = await stripe.paymentIntents.create({
      payment_method: paymentMethodID,
      amount: subscriptionEstimate?.estimate?.invoice_estimate?.amount_due,
      currency: "USD",
      confirm: true,
      confirmation_method: "manual",
      setup_future_usage: "off_session",
      capture_method: "manual",
    })

    const subscriptionOptions = {
      plan_id: planID,
      billing_address: billingAddress,
      customer: {
        first_name: billing.user.firstName || "",
        last_name: billing.user.lastName || "",
        email: billing.user.email || "",
      },
      payment_intent: {
        gw_token: intent.id,
        // TODO: store gateway account id in .env
        gateway_account_id: "gw_BuVXEhRh6XPao1qfg",
      },
    }

    try {
      const subscription = await chargebee.subscription
        .create(subscriptionOptions)
        .request()

      console.log(intent, subscription)
      return intent
    } catch (e) {
      console.error(e)
      throw e
    }
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
        }
        pauseRequests {
          createdAt
          resumeDate
        }
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
