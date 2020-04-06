import { Resolver, Args, Mutation } from "@nestjs/graphql"
import { Customer, User } from "@app/nest_decorators"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { CustomerService } from "@modules/User/services/customer.service"

@Resolver()
export class PaymentMutationsResolver {
  constructor(
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
    private readonly shippingService: ShippingService
  ) {}

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

    // Update customer's shipping address & phone number. Will throw an
    // error if the address is not in NYC
    await this.customerService.updateCustomerDetail(
      user,
      customer,
      shippingAddress,
      phoneNumber
    )

    return null
  }
}
