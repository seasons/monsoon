import { Customer, User } from "@app/decorators"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { CustomerService } from "@modules/User/services/customer.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

@Resolver()
export class PaymentMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
    private readonly shippingService: ShippingService
  ) {}

  @Mutation()
  async updateResumeDate(@Args() { date }, @Customer() customer) {
    await this.paymentService.updateResumeDate(date, customer)
    return true
  }

  @Mutation()
  async pauseSubscription(@Args() { subscriptionID }, @Customer() customer) {
    await this.paymentService.pauseSubscription(subscriptionID, customer)
    return true
  }

  @Mutation()
  async resumeSubscription(
    @Args() { subscriptionID, date },
    @Customer() customer
  ) {
    await this.paymentService.resumeSubscription(subscriptionID, date, customer)
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
    const {
      isValid: billingAddressIsValid,
    } = await this.shippingService.shippoValidateAddress({
      name: user.firstName,
      street1: billingStreet1,
      city: billingCity,
      state: billingState,
      zip: billingPostalCode,
    })
    if (!billingAddressIsValid) {
      throw new Error("Billing address is invalid")
    }

    // Update user's billing address on chargebee
    await this.paymentService.updateChargebeeBillingAddress(
      user.id,
      billingStreet1,
      billingStreet2,
      billingCity,
      billingState,
      billingPostalCode
    )

    // Update customer's billing address
    await this.paymentService.updateCustomerBillingAddress(
      user.id,
      customer.id,
      billingStreet1,
      billingStreet2,
      billingCity,
      billingState,
      billingPostalCode
    )

    // Update customer's shipping address & phone number. Unlike before, will
    // accept all valid addresses. Will NOT throw an error if the address is
    // not in NYC.
    await this.customerService.updateCustomerDetail(
      user,
      customer,
      shippingAddress,
      phoneNumber
    )

    return null
  }

  @Mutation()
  async refundInvoice(@Args() { input: args }) {
    return await this.paymentService.refundInvoice(args)
  }
}
