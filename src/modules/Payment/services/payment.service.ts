import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PaymentPlanTier, User } from "@app/prisma"
import { PauseType } from "@app/prisma/prisma.binding"
import { EmailService } from "@modules/Email/services/email.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { AuthService } from "@modules/User/services/auth.service"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import { camelCase, get, head, identity, snakeCase, upperFirst } from "lodash"
import { DateTime } from "luxon"

import {
  BillingAddress,
  Card,
  Coupon,
  CouponType,
  Invoice,
  InvoicesDataLoader,
  RefundInvoiceInput,
  Transaction,
  TransactionsDataLoader,
} from "../payment.types"

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
export class PaymentService {
  constructor(
    private readonly shippingService: ShippingService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly emailService: EmailService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly segment: SegmentService,
    private readonly error: ErrorService
  ) {}

  async addShippingCharge(customer, shippingCode) {
    try {
      const customerWithShippingData = await this.prisma.binding.query.customer(
        { where: { id: customer.id } },
        `
        {
          id
          membership {
            id
            subscriptionId
          }
          detail {
            id
            shippingAddress {
              id
              shippingOptions {
                id
                externalCost
                shippingMethod {
                  id
                  code
                }
              }
            }
          }
        }
      `
      )

      const { membership, detail } = customerWithShippingData

      const subscriptionID = membership.subscriptionId
      const shippingOptions = detail?.shippingAddress?.shippingOptions
      const shippingOption = shippingOptions.find(
        option => option.shippingMethod.code === shippingCode
      )
      const externalCost = shippingOption.externalCost

      if (externalCost !== 0) {
        await chargebee.invoice
          .charge_addon({
            subscription_id: subscriptionID,
            addon_id: shippingOption.shippingMethod.code?.toLowerCase(),
            addon_unit_price: externalCost,
            addon_quantity: 1,
          })
          .request()
      }

      return shippingOption.id
    } catch (e) {
      this.error.setExtraContext({ shippingCode })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(JSON.stringify(e))
    }
  }

  async changeCustomerPlan(planID, customer) {
    const reservations = await this.prisma.client
      .customer({ id: customer.id })
      .reservations({ orderBy: "createdAt_DESC" })
    const latestReservation = head(reservations)
    if (
      latestReservation &&
      !["Completed", "Cancelled"].includes(latestReservation.status)
    ) {
      throw new Error(
        `You must return your current reservation before changing your plan.`
      )
    }

    try {
      const customerWithMembershipData = await this.prisma.binding.query.customer(
        { where: { id: customer.id } },
        `
          {
            id
            membership {
              id
              subscriptionId
              plan {
                id
              }
            }
          }
        `
      )

      const { membership } = customerWithMembershipData

      const subscriptionID = membership.subscriptionId

      await chargebee.subscription
        .update(subscriptionID, {
          plan_id: planID,
        })
        .request()

      await this.prisma.client.updateCustomerMembership({
        where: { id: membership.id },
        data: {
          plan: { connect: { planID } },
        },
      })
    } catch (e) {
      this.error.setExtraContext({ planID })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error updating to new plan: ${e.message}`)
    }
  }

  async updatePaymentMethodWithStripeToken(planID, token, customer, tokenType) {
    try {
      const customerWithUserData = await this.prisma.binding.query.customer(
        { where: { id: customer.id } },
        `
          {
            id
            user {
              id
              firstName
              lastName
              email
            }
            billingInfo {
              id
            }
          }
        `
      )

      const { user, billingInfo } = customerWithUserData

      const tokenBillingAddressCity = token.card.addressCity || ""
      const tokenBillingAddress1 = token.card.addressLine1 || ""
      const tokenBillingAddress2 = token.card?.addressLine2 || ""
      const tokenBillingAddressState = token.card.addressState || ""
      const tokenBillingAddressZip = token.card.addressZip || ""
      const tokenBillingAddressCountry =
        token.card.addressCountry?.toUpperCase() || ""

      const chargebeeBillingAddress = {
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        line1: tokenBillingAddress1,
        line2: tokenBillingAddress2,
        city: tokenBillingAddressCity,
        state: tokenBillingAddressState,
        zip: tokenBillingAddressZip,
        country: tokenBillingAddressCountry,
      }

      await chargebee.customer
        .update_billing_info(user.id, {
          billing_address: chargebeeBillingAddress,
        })
        .request()

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

      const last4 = token?.card?.last4
      const brand = token?.card?.brand
      const billingInfoID = billingInfo?.id

      const prismaBillingAddressData = {
        city: tokenBillingAddressCity,
        postal_code: tokenBillingAddressZip,
        state: tokenBillingAddressState,
        street1: tokenBillingAddress1,
        street2: tokenBillingAddress2,
        country: tokenBillingAddressCountry,
      }

      await this.prisma.client.updateBillingInfo({
        where: { id: billingInfoID },
        data: { ...prismaBillingAddressData, brand, last_digits: last4 },
      })
    } catch (e) {
      this.error.setExtraContext({ planID, token, tokenType })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error updating your payment method ${e}`)
    }
  }

  async stripeTokenCheckout(planID, token, customer, tokenType, couponID) {
    const customerWithUserData = await this.prisma.binding.query.customer(
      { where: { id: customer.id } },
      `
        {
          id
          detail {
            id
            impactId
          }
          user {
            id
            firstName
            lastName
            email
          }
          utm {
            source
            medium
            campaign
            term
            content
          }
        }
      `
    )

    const { user } = customerWithUserData

    const billingAddress = {
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      line1: token.card.addressLine1 || "",
      line2: token.card?.addressLine2 || "",
      city: token.card.addressCity || "",
      state: token.card.addressState || "",
      zip: token.card.addressZip || "",
      country: token.card.addressCountry?.toUpperCase() || "",
    }

    let chargebeeCustomer
    let existingCustomer

    try {
      // The customer may exist if their first card was declined
      existingCustomer = await chargebee.customer.retrieve(user.id).request()
    } catch (e) {
      // continue
    }

    if (existingCustomer?.customer?.id) {
      chargebeeCustomer = existingCustomer
    } else {
      chargebeeCustomer = await chargebee.customer
        .create({
          id: user.id,
          first_name: user.firstName || "",
          last_name: user.lastName || "",
          email: user.email || "",
          billing_address: billingAddress,
        })
        .request()
    }

    // Create the payment method. If one already exists, delete it
    // and create a new one using the passed token.
    let paymentSource
    const customerPaymentSources = await chargebee.payment_source
      .list({
        "customer_id[is]": chargebeeCustomer.customer.id,
      })
      .request()
    paymentSource = head(customerPaymentSources.list)
    if (!!paymentSource) {
      await chargebee.payment_source
        .delete(paymentSource.payment_source.id)
        .request()
    }
    paymentSource = await chargebee.payment_source
      .create_using_temp_token({
        tmp_token: token.tokenId,
        type: tokenType ? tokenType : "apple_pay",
        customer_id: chargebeeCustomer.customer.id,
      })
      .request()

    const payload = await chargebee.subscription
      .create_for_customer(chargebeeCustomer.customer.id, {
        plan_id: planID,
        coupon_ids: !!couponID ? [couponID] : [],
      })
      .request()

    const total = payload.invoice?.total

    await this.createPrismaSubscription(
      user.id,
      payload.customer,
      paymentSource.payment_source.card,
      payload.subscription
    )

    this.segment.trackSubscribed(user.id, {
      tier: this.getPaymentPlanTier(planID),
      planID,
      method: "ApplePay",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      impactId: customerWithUserData.detail?.impactId,
      total,
      ...this.utils.formatUTMForSegment(customerWithUserData.utm),
    })
  }

  async pauseSubscription(
    subscriptionId,
    customer,
    pauseType: PauseType = "WithoutItems"
  ) {
    try {
      if (pauseType === "WithItems") {
        const customerWithMembership = await this.prisma.binding.query.customer(
          { where: { id: customer.id } },
          `
          {
            id
            membership {
              id
              subscription {
                id
                currentTermEnd
              }
            }
          }
          `
        )

        const termEnd = customerWithMembership?.membership?.subscription.currentTermEnd.toString()
        const resumeDateISO = DateTime.fromISO(termEnd)
          .plus({ months: 1 })
          .toISO()

        const customerMembership = await this.prisma.client.customerMembership({
          id: customerWithMembership.membership?.id,
        })

        await this.prisma.client.createPauseRequest({
          membership: { connect: { id: customerMembership.id } },
          pausePending: true,
          pauseDate: new Date(termEnd),
          resumeDate: new Date(resumeDateISO),
          pauseType,
        })
      } else {
        const result = await chargebee.subscription
          .pause(subscriptionId, {
            pause_option: "immediately",
          })
          .request()

        const termEnd = result?.subscription?.current_term_end

        const customerWithMembership = await this.prisma.binding.query.customer(
          { where: { id: customer.id } },
          `
            {
              id
              membership {
                id
              }
            }
          `
        )

        const pauseDateISO = DateTime.fromSeconds(termEnd).toISO()
        const resumeDateISO = DateTime.fromSeconds(termEnd)
          .plus({ months: 1 })
          .toISO()

        const customerMembership = await this.prisma.client.customerMembership({
          id: customerWithMembership.membership?.id,
        })

        await this.prisma.client.createPauseRequest({
          membership: { connect: { id: customerMembership.id } },
          pausePending: true,
          pauseDate: new Date(pauseDateISO),
          resumeDate: new Date(resumeDateISO),
          pauseType,
        })
      }
    } catch (e) {
      this.error.setExtraContext({ subscriptionId })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error pausing subscription: ${JSON.stringify(e)}`)
    }
  }

  async removeScheduledPause(subscriptionId, customer) {
    try {
      const pauseRequests = await this.prisma.client.pauseRequests({
        where: {
          membership: {
            customer: {
              id: customer.id,
            },
          },
        },
        orderBy: "createdAt_DESC",
      })

      const pauseRequest = head(pauseRequests)

      if (pauseRequest.pauseType === "WithoutItems") {
        await chargebee.subscription
          .resume(subscriptionId, {
            resume_option: "immediately",
            charges_handling: "add_to_unbilled_charges",
          })
          .request()
      }

      await this.prisma.client.updatePauseRequest({
        where: { id: pauseRequest.id },
        data: { pausePending: false },
      })
    } catch (e) {
      if (
        e?.api_error_code &&
        e?.api_error_code !== "invalid_state_for_request"
      ) {
        this.error.setExtraContext({ subscriptionId })
        this.error.setExtraContext(customer, "customer")
        this.error.captureError(e)
        throw new Error(`Error removing scheduled pause: ${e}`)
      }
    }
  }

  async createSubscription(
    planID: string,
    billingAddress: BillingAddress,
    user: User,
    card: Card
  ) {
    return await chargebee.subscription
      .create({
        plan_id: planID,
        billingAddress,
        customer: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
        },
        card,
      })
      .request()
  }

  async getGift(id) {
    return await chargebee.gift.retrieve(id).request()
  }

  async getGiftCheckoutPage(planId) {
    return await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_gift({
          subscription: {
            plan_id: planId,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
  }

  async getHostedCheckoutPage(
    planId,
    userId,
    email,
    firstName,
    lastName,
    phoneNumber,
    couponId
  ) {
    return await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_new({
          subscription: {
            plan_id: planId,
          },
          customer: {
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
          },
          redirect_url:
            "https://wearseasons.com/chargebee-mobile-checkout-success",
          coupon_ids: !!couponId ? [couponId] : [],
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
  }

  async getHostedUpdatePaymentPage(customerId) {
    return await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .manage_payment_sources({
          customer: {
            id: customerId,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
  }

  async chargebeeCustomerChanged(userID: string, card: any) {
    const {
      card_type: brand,
      expiry_month,
      expiry_year,
      first_name,
      last_name,
      last4,
    } = card
    const customers = await this.prisma.client.customers({
      where: { user: { id: userID } },
    })
    if (customers?.length) {
      const customer = customers[0]
      this.customerService.updateCustomerBillingInfo({
        customerId: customer.id,
        billingInfo: {
          brand,
          expiration_month: expiry_month,
          expiration_year: expiry_year,
          last_digits: last4,
          name: `${first_name} ${last_name}`,
        },
      })
    }
  }

  async createPrismaSubscription(
    userID: string,
    chargebeeCustomer: any,
    card: any,
    subscription: any,
    giftID?: string
  ) {
    const subscriptionData: SubscriptionData = {
      nextBillingAt: DateTime.fromSeconds(subscription.next_billing_at).toISO(),
      currentTermEnd: DateTime.fromSeconds(
        subscription.current_term_end
      ).toISO(),
      currentTermStart: DateTime.fromSeconds(
        subscription.current_term_start
      ).toISO(),
      status: subscription.status,
      planPrice: subscription.plan_amount,
      subscriptionId: subscription.id,
      planID: subscription.plan_id.replace("-gift", ""),
    }

    // Retrieve plan and billing data
    const billingInfo = this.paymentUtils.createBillingInfoObject(
      card,
      chargebeeCustomer
    )

    // Save to prisma
    const prismaUser = await this.prisma.client.user({ id: userID })
    if (!prismaUser) {
      throw new Error(`Could not find user with id: ${userID}`)
    }
    const prismaCustomer = await this.authService.getCustomerFromUserID(
      prismaUser.id
    )
    if (!prismaCustomer) {
      throw new Error(`Could not find customer with user id: ${prismaUser.id}`)
    }

    await this.prisma.client.updateCustomer({
      data: {
        billingInfo: {
          create: billingInfo,
        },
        status: "Active",
      },
      where: { id: prismaCustomer.id },
    })

    await this.prisma.client.createCustomerMembership({
      customer: { connect: { id: prismaCustomer.id } },
      subscriptionId: subscriptionData.subscriptionId,
      giftId: giftID,
      plan: { connect: { planID: subscriptionData.planID } },
      subscription: {
        create: subscriptionData,
      },
    })

    // Send welcome to seasons email
    await this.emailService.sendSubscribedEmail(prismaUser)
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
    const billingInfoId = await this.prisma.client
      .customer({ id: customerID })
      .billingInfo()
      .id()
    if (billingInfoId) {
      await this.prisma.client.updateBillingInfo({
        data: billingAddressData,
        where: { id: billingInfoId },
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

      // Create new billing info object
      const billingInfo = await this.prisma.client.createBillingInfo({
        ...billingAddressData,
        brand,
        expiration_month: expiry_month,
        expiration_year: expiry_year,
        last_digits: last4,
        name: `${first_name} ${last_name}`,
      })

      // Connect new billing info to customer object
      await this.prisma.client.updateCustomer({
        data: { billingInfo: { connect: { id: billingInfo.id } } },
        where: { id: customerID },
      })
    }
  }

  getPaymentPlanTier(planID): PaymentPlanTier {
    if (planID.includes("essential")) {
      return "Essential"
    } else {
      return "AllAccess"
    }
  }

  async getCustomerInvoiceHistory(
    // payment customerId is equivalent to prisma user id, NOT prisma customer id
    customerId: string,
    invoicesLoader: InvoicesDataLoader,
    transactionsForCustomerLoader: TransactionsDataLoader
  ) {
    const invoices = this.utils.filterErrors<Invoice>(
      await invoicesLoader.load(customerId)
    )
    if (!invoices) {
      return null
    }

    return Promise.all(
      invoices.map(async invoice =>
        identity({
          ...this.formatInvoice(invoice),
          transactions: this.utils
            .filterErrors<Transaction>(
              await transactionsForCustomerLoader.load(customerId)
            )
            ?.filter(a =>
              this.getInvoiceTransactionIds(invoice)?.includes(a.id)
            )
            ?.map(this.formatTransaction),
        })
      )
    )
  }

  async getCustomerTransactionHistory(
    // payment customerId is equivalent to prisma user id, NOT prisma customer id
    customerId: string,
    transactionsForCustomerloader: TransactionsDataLoader
  ) {
    return this.utils
      .filterErrors<Transaction>(
        await transactionsForCustomerloader.load(customerId)
      )
      ?.map(this.formatTransaction)
  }

  async checkCoupon(couponID): Promise<Coupon> {
    try {
      const coupon = await chargebee.coupon.retrieve(couponID).request()
      if (coupon.coupon.status === "active") {
        return {
          id: couponID,
          percentage: coupon.coupon.discount_percentage,
          amount: coupon.coupon.discount_amount,
          type: upperFirst(
            camelCase(coupon.coupon.discount_type)
          ) as CouponType,
        }
      } else {
        throw new Error("Coupon expired")
      }
    } catch {
      throw new Error("Coupon not found")
    }
  }

  async refundInvoice({
    invoiceId,
    refundAmount,
    comment,
    customerNotes,
    reasonCode,
  }: RefundInvoiceInput) {
    await chargebee.invoice
      .refund(invoiceId, {
        refund_amount: refundAmount,
        credit_note: {
          reason_code: snakeCase(reasonCode),
        },
        comment,
        customer_notes: customerNotes,
      })
      .request()
    return true
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

  /*
   * This is scheduled for deletion after chargebee checkout flow is no longer used
   */
  prismaPlanToChargebeePlanId(plan) {
    let chargebeePlanId
    if (plan === "AllAccess") {
      chargebeePlanId = "all-access"
    } else if (plan === "Essential") {
      chargebeePlanId = "essential"
    } else if (plan === "essential" || plan === "all-access") {
      chargebeePlanId = plan
    } else {
      throw new Error(`unrecognized planID: ${plan}`)
    }
    return chargebeePlanId
  }

  private getInvoiceTransactionIds(invoice): string[] {
    return invoice.linkedPayments.map(a => a.txnId)
  }

  /**
   * Define as arrow func to preserve `this` binding
   */
  private formatInvoice = (invoice: Invoice) =>
    identity({
      ...invoice,
      status: upperFirst(camelCase(invoice.status)),
      amount: invoice.total,
      closingDate: this.utils.secondsSinceEpochToISOString(invoice.date),
      dueDate: this.utils.secondsSinceEpochToISOString(invoice.dueDate, true),
      creditNotes: invoice.issuedCreditNotes.map(a =>
        identity({
          ...a,
          reasonCode: upperFirst(camelCase(a.reasonCode)),
          status: upperFirst(camelCase(a.status)),
          date: this.utils.secondsSinceEpochToISOString(a.date),
        })
      ),
    })

  /**
   * Define as arrow func to preserve `this` binding
   */
  private formatTransaction = (transaction: Transaction) =>
    identity({
      ...transaction,
      status: upperFirst(transaction.status),
      type: upperFirst(transaction.type),
      lastFour: transaction.maskedCardNumber?.replace(/[*]/g, ""),
      date: this.utils.secondsSinceEpochToISOString(transaction.date, true),
      settledAt: this.utils.secondsSinceEpochToISOString(
        transaction.settledAt,
        true
      ),
    })
}
