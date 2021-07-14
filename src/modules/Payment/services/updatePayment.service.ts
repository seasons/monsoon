import { ErrorService } from "@app/modules/Error/services/error.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { AuthService } from "@modules/User/services/auth.service"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { get, head } from "lodash"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
})

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
    planID,
    customer,
    token,
    tokenType,
    paymentMethodID,
    billing
  ) {
    try {
      const _customerWithUserData = await this.prisma.client2.customer.findUnique(
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
      const customerWithUserData = this.prisma.sanitizePayload(
        _customerWithUserData,
        "Customer"
      )

      const { user, billingInfo } = customerWithUserData
      console.log(
        "this.paymentUtils.createBillingAddresses",
        this.paymentUtils.createBillingAddresses
      )
      console.log("this.paymentUtils", this.paymentUtils)
      const {
        prismaBillingAddress,
        chargebeeBillingAddress,
      } = this.paymentUtils.createBillingAddresses(user, token, billing)

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

      if (token && tokenType) {
        // FIXME:
        // TmpToken is deprecated but still used in harvest, should remove
        const { last4, brand } = await this.updatePaymentWithTmpToken(
          token,
          subscription,
          planID,
          tokenType
        )
        _last4 = last4
        _brand = brand
      } else if (paymentMethodID && billing) {
        const { last4, brand } = await this.updatePaymentWithGWToken(
          planID,
          chargebeeBillingAddress,
          paymentMethodID,
          subscription
        )
        _last4 = last4
        _brand = brand
      } else {
        throw new Error(
          `Error updating your payment method, insufficient data provided`
        )
      }

      await this.prisma.client2.billingInfo.update({
        where: { id: billingInfo.id },
        data: { ...prismaBillingAddress, brand: _brand, last_digits: _last4 },
      })
    } catch (e) {
      this.error.setExtraContext({ planID, token, tokenType })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error updating your payment method ${e}`)
    }
  }

  async updatePaymentWithTmpToken(token, subscription, planID, tokenType) {
    await chargebee.subscription
      .update(subscription.id, {
        plan_id: planID,
        invoice_immediately: false,
        payment_method: {
          tmp_token: token.tokenId,
          type: tokenType ? tokenType : "apple_pay",
        },
      })
      .request()

    return { brand: token?.card?.brand, last4: token?.card?.last4 }
  }

  async updatePaymentWithGWToken(
    planID,
    chargebeeBillingAddress,
    paymentMethodID,
    subscription
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

    const intent = await stripe.paymentIntents.create({
      payment_method: paymentMethodID,
      amount: amountDue,
      currency: "USD",
      confirm: true,
      confirmation_method: "manual",
      setup_future_usage: "off_session",
      capture_method: "manual",
    })

    const subscriptionOptions = {
      plan_id: planID,
      invoice_immediately: false,
      billing_address: chargebeeBillingAddress,
      payment_intent: {
        gw_token: intent.id,
        gateway_account_id: process.env.CHARGEBEE_GATEWAY_ACCOUNT_ID,
      },
    }

    const payload = await chargebee.subscription
      .update(subscription.id, {
        subscriptionOptions,
      })
      .request()

    const brand = payload.card.card_type
    const last4 = payload.card.last4

    return { brand, last4 }
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
    const billingCity = billingAddress?.city
    const billingPostalCode = billingAddress?.postalCode
    const billingState = billingAddress?.state
    const billingStreet1 = billingAddress?.street1
    const billingStreet2 = billingAddress?.street2

    const {
      city: shippingCity,
      postalCode: shippingPostalCode,
      state: shippingState,
      street1: shippingStreet1,
    } = shippingAddress

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
      city: billingCity,
      postal_code: billingPostalCode,
      state: billingState,
      street1: billingStreet1,
      street2: billingStreet2,
    }

    const billingInfo = await this.prisma.client2.billingInfo.findFirst({
      where: { customer: { id: customerID } },
    })

    if (billingInfo.id) {
      await this.prisma.client2.billingInfo.update({
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

      const billingInfo = await this.prisma.client2.billingInfo.create({
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
