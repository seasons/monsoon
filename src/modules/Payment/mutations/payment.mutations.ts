import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { UpdatePaymentService } from "@modules/Payment/services/updatePayment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { ApolloError } from "apollo-server"

@Resolver()
export class PaymentMutationsResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly updatePaymentService: UpdatePaymentService,
    private readonly paymentUtils: PaymentUtilsService
  ) {}

  /**
   * This method is utilized by the signup flow
   * the customer's credit card info
   *
   * Platform: Web (flare)
   */
  @Mutation()
  async processPayment() {
    throw new ApolloError("This method is deprecated")
  }

  /**
   * To be called after [3Ds secure flow](https://stripe.com/docs/payments/3d-secure#when-to-use-3d-secure) is completed
   *
   * Platform: Web (flare), Native mobile (harvest)
   */
  @Mutation()
  async confirmPayment() {
    throw new ApolloError("This method is deprecated")
  }

  /**
   * This method is used for both credit card and apple pay checkouts
   *
   * Platform: Native mobile (harvest)
   */
  @Mutation()
  async applePayCheckout(
    @Args() { planID, token, tokenType, couponID, shipping },
    @Customer() customer,
    @Application() application
  ) {
    await this.paymentService.stripeTokenCheckout(
      planID,
      token,
      customer,
      tokenType,
      couponID,
      application,
      shipping
    )
    return true
  }

  @Mutation()
  async updatePaymentMethod(
    @Args() { planID, paymentMethodID, billing },
    @Customer() customer
  ) {
    const intent = await this.updatePaymentService.updatePaymentMethod(
      planID,
      customer,
      null,
      null,
      paymentMethodID,
      billing
    )
    return intent
  }

  @Mutation()
  async confirmPaymentMethodUpdate(
    @Args() { paymentIntentID, billing },
    @Customer() customer,
    @User() user
  ) {
    return this.updatePaymentService.confirmPaymentMethodUpdate({
      paymentIntentID,
      userId: user.id,
      chargebeeBillingAddress: billing,
    })
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
  async updateResumeDate(@Args() { date }, @Customer() customer) {
    await this.paymentUtils.updateResumeDate(date, customer)
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
