import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { CustomerService } from "@modules/User/services/customer.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"
import states from "us-state-converter"

@Resolver()
export class PaymentMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
    private readonly shippingService: ShippingService,
    private readonly segment: SegmentService,
    private readonly email: EmailService
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
    await this.paymentService.updateResumeDate(date, customer)
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
    @Customer() customer,
    @User() user
  ) {
    await this.paymentService.resumeSubscription(subscriptionID, date, customer)
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
          planID
        }
      }
    }`
    )) as any

    const tier = customerWithData?.membership?.plan?.tier
    const planID = customerWithData?.membership?.plan?.planID

    this.segment.track(user.id, "Resumed Subscription", {
      ...pick(user, ["firstName", "lastName", "email"]),
      planID,
      tier,
    })
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
    const {
      city: billingCity,
      postalCode: billingPostalCode,
      state: billingState,
      street1: billingStreet1,
      street2: billingStreet2,
    } = billingAddress
    let abbreviatedBillingState = billingState

    if (!!billingState && billingState.length > 2) {
      const abbr = states.abbr(billingState)
      if (abbr) {
        abbreviatedBillingState = abbr
      }
    }

    const {
      isValid: billingAddressIsValid,
    } = await this.shippingService.shippoValidateAddress({
      name: user.firstName,
      street1: billingStreet1,
      city: billingCity,
      state: abbreviatedBillingState,
      zip: billingPostalCode,
    })
    if (!billingAddressIsValid) {
      throw new Error("Your billing address is invalid")
    }

    const {
      city: shippingCity,
      postalCode: shippingPostalCode,
      state: shippingState,
      street1: shippingStreet1,
    } = shippingAddress

    let abbreviatedShippingState = shippingState
    if (!!shippingState && shippingState.length > 2) {
      const abbr = states.abbr(shippingState)
      if (abbr) {
        abbreviatedShippingState = abbr
      }
    }

    const {
      isValid: shippingAddressIsValid,
    } = await this.shippingService.shippoValidateAddress({
      name: user.firstName,
      street1: shippingStreet1,
      city: shippingCity,
      state: abbreviatedShippingState,
      zip: shippingPostalCode,
    })
    if (!shippingAddressIsValid) {
      throw new Error("Your shipping address is invalid")
    }

    // Update user's billing address on chargebee
    await this.paymentService.updateChargebeeBillingAddress(
      user.id,
      billingStreet1,
      billingStreet2,
      billingCity,
      abbreviatedBillingState,
      billingPostalCode
    )

    // Update customer's billing address
    await this.paymentService.updateCustomerBillingAddress(
      user.id,
      customer.id,
      billingStreet1,
      billingStreet2,
      billingCity,
      abbreviatedBillingState,
      billingPostalCode
    )

    // Update customer's shipping address & phone number. Unlike before, will
    // accept all valid addresses. Will NOT throw an error if the address is
    // not in NYC.
    await this.customerService.updateCustomerDetail(
      user,
      customer,
      { ...shippingAddress, state: abbreviatedShippingState },
      phoneNumber
    )

    // Adds the customer's shipping options to their location record
    const customerLocationID = await this.prisma.client
      .customer({
        id: customer.id,
      })
      .detail()
      .shippingAddress()
      .id()

    await this.customerService.addCustomerLocationShippingOptions(
      shippingState,
      customerLocationID
    )

    return null
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
