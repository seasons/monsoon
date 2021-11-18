import { ErrorService } from "@app/modules/Error/services/error.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import {
  PaymentUtilsService,
  stripe,
} from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { get, head } from "lodash"

export interface SubscriptionData {
  nextBillingAt: string
  currentTermEnd: string
  currentTermStart: string
  status: string
  planPrice: number
  subscriptionId: string
  planID: string
}

@Injectable()
export class UpdatePaymentService {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly paymentUtils: PaymentUtilsService,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly error: ErrorService
  ) {}

  async updatePaymentMethod(
    _planID,
    customer,
    token,
    tokenType,
    paymentMethodID,
    billing,
    card
  ) {
    try {
      const customerWithUserData = await this.prisma.client.customer.findUnique(
        {
          where: { id: customer.id },
          select: {
            id: true,
            detail: { select: { id: true, impactId: true } },
            billingInfo: { select: { id: true } },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            membership: { select: { plan: { select: { planID: true } } } },
            utm: {
              select: {
                source: true,
                medium: true,
                campaign: true,
                term: true,
                content: true,
              },
            },
          },
        }
      )

      const { user, billingInfo } = customerWithUserData
      const {
        prismaBillingAddress,
        chargebeeBillingAddress,
      } = this.paymentUtils.createBillingAddresses(user, token, billing)

      const planID = _planID ?? customerWithUserData?.membership?.plan?.planID
      const subscriptions = await chargebee.subscription
        .list({
          plan_id: { in: [planID] },
          customer_id: { is: user.id },
        })
        .request()

      const subscription = (head(subscriptions.list) as any)?.subscription

      // If chargebee account is paused
      if (subscription.status === "paused") {
        // chargeebee account is active
        await chargebee.subscription
          .resume(subscription.id, {
            resume_option: "immediately",
            charges_handling: "add_to_unbilled_charges",
          })
          .request()
      }

      let _brand
      let _last4
      let intent

      if (token && tokenType) {
        // FIXME:
        // TmpToken is deprecated but still used in harvest, should remove
        const { last4, brand } = await this.updatePaymentWithTmpToken(
          token,
          tokenType,
          user.id,
          chargebeeBillingAddress
        )
        _last4 = last4
        _brand = brand
      } else if (paymentMethodID && billing) {
        const {
          last4,
          brand,
          paymentIntent,
        } = await this.updatePaymentWithGWToken(
          planID,
          chargebeeBillingAddress,
          paymentMethodID,
          user.id
        )
        _last4 = last4
        _brand = brand
        intent = paymentIntent
      } else {
        throw new Error(
          `Error updating your payment method, insufficient data provided`
        )
      }

      const data = {
        ...prismaBillingAddress,
        brand: _brand,
        last_digits: _last4,
      }

      if (billingInfo?.id) {
        await this.prisma.client.billingInfo.update({
          where: { id: billingInfo?.id },
          data,
        })
      } else {
        const billingInfo = await this.prisma.client.billingInfo.create({
          data: {
            ...data,
            expiration_month: card?.expMonth,
            expiration_year: card?.expYear,
            brand: card?.brand,
            last_digits: card?.last4,
          },
        })

        await this.prisma.client.customer.update({
          where: {
            id: customer.id,
          },
          data: {
            billingInfo: {
              connect: { id: billingInfo.id },
            },
          },
        })
      }

      return intent
    } catch (e) {
      this.error.setExtraContext({ token, tokenType })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw e
    }
  }

  private async updatePaymentWithTmpToken(
    token,
    tokenType,
    userId,
    chargebeeBillingAddress
  ) {
    // Update card
    const params = {
      customer_id: userId,
      gateway_account_id: process.env.CHARGEBEE_GATEWAY_ACCOUNT_ID,
      type: tokenType ?? "apple_pay",
      tmp_token: token.tokenId,
      replace_primary_payment_source: true,
    }
    await chargebee.payment_source.create_using_temp_token(params).request()
    await chargebee.customer
      .update_billing_info(userId, { billing_address: chargebeeBillingAddress })
      .request()

    return { brand: token?.card?.brand, last4: token?.card?.last4 }
  }

  private async updatePaymentWithGWToken(
    planID,
    chargebeeBillingAddress,
    paymentMethodID,
    userId
  ) {
    const subscriptionEstimate = await chargebee.estimate
      .create_subscription({
        billing_address: chargebeeBillingAddress,
        subscription: {
          plan_id: planID,
        },
      })
      .request()

    const amountDue =
      subscriptionEstimate?.estimate?.invoice_estimate?.amount_due

    const intent = await this.paymentUtils.createPaymentIntent(
      paymentMethodID,
      amountDue
    )

    if (
      intent.status === "requires_action" &&
      intent.next_action.use_stripe_sdk
    ) {
      return {
        paymentIntent: intent,
        last4: "",
        brand: "",
      }
    }

    return this.confirmPaymentMethodUpdate({
      paymentIntentID: intent.id,
      userId,
      chargebeeBillingAddress,
    })
  }

  async confirmPaymentMethodUpdate({
    paymentIntentID,
    userId,
    chargebeeBillingAddress,
  }) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentID)
    await stripe.paymentIntents.confirm(paymentIntentID)

    // Update card
    const payload = await chargebee.payment_source
      .create_using_payment_intent({
        customer_id: userId,
        replace_primary_payment_source: true,
        payment_intent: {
          gw_token: intent.id,
          gateway_account_id: process.env.CHARGEBEE_GATEWAY_ACCOUNT_ID,
        },
      })
      .request()

    // Update billing address
    await chargebee.customer
      .update_billing_info(userId, { billing_address: chargebeeBillingAddress })
      .request()

    const {
      payment_source: { card },
    } = payload
    const brand = card.card_type
    const last4 = card.last4

    return { brand, last4, paymentIntent: intent }
  }

  async updateChargebeeBillingAddress(
    userID: string,
    billingStreet1: string,
    billingStreet2: string,
    billingCity: string,
    billingState: string,
    billingPostalCode: string
  ) {
    await new Promise((resolve, reject) => {
      chargebee.customer
        .update_billing_info(userID, {
          billing_address: {
            line1: billingStreet1,
            line2: billingStreet2,
            city: billingCity,
            state: billingState,
            zip: billingPostalCode,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(JSON.stringify(error))
          } else {
            const chargebeeBillingAddress = get(
              result,
              "customer.billing_address"
            )
            if (!chargebeeBillingAddress) {
              reject("Failed to update billing address on chargebee.")
            }
            resolve(chargebeeBillingAddress)
          }
        })
    })
  }

  async updatePaymentAndShipping(
    billingAddress,
    phoneNumber,
    shippingAddress,
    customer,
    user
  ) {
    const billingCity = billingAddress?.city?.trim()
    const billingPostalCode = billingAddress?.postalCode?.trim()
    const billingState = billingAddress?.state?.trim()
    const billingStreet1 = billingAddress?.street1?.trim()
    const billingStreet2 = billingAddress?.street2?.trim()

    const shippingCity = shippingAddress?.city?.trim()
    const shippingPostalCode = shippingAddress?.postalCode?.trim()
    const shippingState = shippingAddress?.state?.trim()
    const shippingStreet1 = shippingAddress?.street1?.trim()
    const shippingStreet2 = shippingAddress?.street2?.trim()

    if (
      !shippingCity ||
      !shippingPostalCode ||
      !shippingState ||
      !shippingStreet1
    ) {
      throw new Error("You're missing a required field")
    }

    const getAbbreviatedState = originalState => {
      if (!originalState) {
        throw new Error(`Invalid state: ${originalState}`)
      }
      if (originalState.length === 2) {
        return originalState
      }
      if (originalState.length > 2) {
        const abbr = this.utils.abbreviateState(originalState)
        if (abbr) {
          return abbr
        } else {
          return originalState?.toUpperCase()
        }
      }
      throw new Error(`Invalid state: ${originalState}`)
    }

    const abbrBillingState = !!billingState
      ? getAbbreviatedState(billingState)
      : ""

    const abbrShippingState = !!shippingState
      ? getAbbreviatedState(shippingState)
      : ""

    const {
      isValid: shippingAddressIsValid,
    } = await this.shippingService.shippoValidateAddress({
      name: user.firstName,
      street1: shippingStreet1,
      street2: shippingStreet2,
      city: shippingCity,
      state: abbrShippingState,
      zip: shippingPostalCode,
    })

    if (!shippingAddressIsValid) {
      throw new Error("Your shipping address is invalid")
    }

    if (
      billingStreet1 &&
      billingCity &&
      abbrBillingState &&
      billingPostalCode
    ) {
      // FIXME:
      // This has been deprecated as of build on 1/22/2021,
      // older builds allowed user to update both shipping and billing
      // the billing update can be removed in the future.

      // Update user's billing address on chargebee
      await this.updateChargebeeBillingAddress(
        user.id,
        billingStreet1,
        billingStreet2,
        billingCity,
        abbrBillingState,
        billingPostalCode
      )
      // Update customer's billing address
      await this.updateCustomerBillingAddress(
        user.id,
        customer.id,
        billingStreet1,
        billingStreet2,
        billingCity,
        abbrBillingState,
        billingPostalCode
      )
    }

    // Update customer's shipping address & phone number. Unlike before, will
    // accept all valid addresses. Will NOT throw an error if the address is
    // not in NYC.

    await this.customerService.updateCustomerDetail(
      user,
      customer,
      { ...shippingAddress, state: abbrShippingState },
      phoneNumber
    )

    return null
  }

  // This is deprecated, should eventually remove
  async updateCustomerBillingAddress(
    userID,
    customerID,
    billingStreet1,
    billingStreet2,
    billingCity,
    billingState,
    billingPostalCode
  ) {
    const billingAddressData = {
      city: billingCity.trim(),
      postal_code: billingPostalCode.trim(),
      state: billingState.trim(),
      street1: billingStreet1.trim(),
      street2: billingStreet2.trim(),
    }

    const billingInfo = await this.prisma.client.billingInfo.findFirst({
      where: { customer: { id: customerID } },
    })

    if (billingInfo.id) {
      await this.prisma.client.billingInfo.update({
        where: { id: billingInfo.id },
        data: billingAddressData,
      })
    } else {
      // Get user's card information from chargebee
      const cardInfo = await this.paymentUtils.getChargebeePaymentSource(userID)
      const {
        brand,
        expiry_month,
        expiry_year,
        first_name,
        last4,
        last_name,
      } = cardInfo

      const billingInfo = await this.prisma.client.billingInfo.create({
        data: {
          customer: {
            connect: {
              id: customerID,
            },
          },
          ...billingAddressData,
          brand,
          expiration_month: expiry_month,
          expiration_year: expiry_year,
          last_digits: last4,
          name: `${first_name} ${last_name}`,
        },
      })

      return billingInfo
    }
  }
}
