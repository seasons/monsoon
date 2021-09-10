import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { PaymentPlanTier } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { camelCase, head, identity, snakeCase, upperFirst } from "lodash"
import Stripe from "stripe"

import {
  Coupon,
  CouponType,
  Invoice,
  InvoicesDataLoader,
  RefundInvoiceInput,
  Transaction,
  TransactionsDataLoader,
} from "../payment.types"
import { SubscriptionService } from "./subscription.service"

const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
})

@Injectable()
export class PaymentService {
  constructor(
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly segment: SegmentService,
    private readonly error: ErrorService,
    private readonly subscription: SubscriptionService,
    private readonly paymentUtils: PaymentUtilsService
  ) {}

  async addShippingCharge(customer, shippingCode) {
    try {
      const customerWithShippingData = await this.prisma.client.customer.findUnique(
        {
          where: {
            id: customer.id,
          },
          select: {
            membership: true,
            detail: {
              select: {
                id: true,
                shippingAddress: {
                  select: {
                    shippingOptions: {
                      select: {
                        id: true,
                        shippingMethod: true,
                        externalCost: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }
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

      return {
        shippingOption,
      }
    } catch (e) {
      this.error.setExtraContext({ shippingCode })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw e
    }
  }

  async processPayment({ planID, paymentMethodID, billing }) {
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

    const amountDue =
      subscriptionEstimate?.estimate?.invoice_estimate?.amount_due
    const intent = await this.paymentUtils.createPaymentIntent(
      paymentMethodID,
      amountDue
    )
    return intent
  }

  async confirmPayment({
    paymentIntentID,
    planID,
    couponID,
    billing,
    customer,
    shipping,
    application,
  }) {
    const customerWithUserData = await this.prisma.client.customer.findUnique({
      where: {
        id: customer.id,
      },
      select: {
        id: true,
        detail: true,
        user: true,
        utm: true,
      },
    })
    const user = customerWithUserData?.user

    const intent = await stripe.paymentIntents.retrieve(paymentIntentID)
    await stripe.paymentIntents.confirm(intent.id)

    let shippingAddress
    if (shipping?.address) {
      shippingAddress = {
        name: `${shipping.firstName} ${shipping.lastName}`,
        address1: shipping.address.line1,
        address2: shipping.address.line2,
        city: shipping.address.city,
        country: shipping.address.country,
        state: shipping.address.state,
        zipCode: shipping.address.postal_code,
        locationType: "Customer",
      }
    }

    const billingAddress = {
      first_name: billing.user.firstName || "",
      last_name: billing.user.lastName || "",
      ...billing.address,
      zip: billing.address.postal_code || "",
      country: "US", // assume its US for now, because we need it for taxes.
    }

    const start_date = this.paymentUtils.getSubscriptionStartDate()
    const subscriptionOptions = {
      plan_id: planID,
      billing_address: billingAddress,
      coupon_ids: !!couponID ? [couponID] : [],
      start_date,
      customer: {
        id: customerWithUserData.user.id,
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        email: user.email || "",
      },
      payment_intent: {
        gw_token: intent.id,
        gateway_account_id: process.env.CHARGEBEE_GATEWAY_ACCOUNT_ID,
      },
    }

    const subscriptionData = await chargebee.subscription
      .create(subscriptionOptions)
      .request()

    const data = await this.subscription.createPrismaSubscription(
      customerWithUserData.user.id,
      subscriptionData.customer,
      subscriptionData.card,
      subscriptionData.subscription,
      null,
      shippingAddress
    )

    this.segment.trackSubscribed(user.id, {
      tier: this.getPaymentPlanTier(planID),
      planID,
      method: "CreditCard",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      impactId: customerWithUserData.detail?.impactId,
      total: intent.amount,
      application,
      discoveryReference: customerWithUserData.detail?.discoveryReference,
      ...this.utils.formatUTMForSegment(customerWithUserData.utm),
    })

    return data
  }

  async stripeTokenCheckout(
    planID,
    token,
    customer,
    tokenType,
    couponID,
    application,
    shippingAddress
  ) {
    const customerWithUserData = await this.prisma.client.customer.findUnique({
      where: {
        id: customer.id,
      },
      select: {
        id: true,
        detail: true,
        user: true,
        utm: true,
      },
    })

    const { user } = customerWithUserData

    const billingAddress = {
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      line1: token.card.addressLine1 || "",
      line2: token.card?.addressLine2 || "",
      city: token.card.addressCity || "",
      state: token.card.addressState || "",
      zip: token.card.addressZip || "",
      country: "US", // assume its US for now, because we need it for taxes.
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

    await this.subscription.createPrismaSubscription(
      user.id,
      payload.customer,
      paymentSource.payment_source.card,
      payload.subscription,
      null,
      shippingAddress
    )

    this.segment.trackSubscribed(user.id, {
      tier: this.getPaymentPlanTier(planID),
      planID,
      method: "ApplePay",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      impactId: customerWithUserData.detail?.impactId,
      discoveryReference: customerWithUserData?.detail?.discoveryReference,
      total,
      application,
      ...this.utils.formatUTMForSegment(customerWithUserData.utm),
    })
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
      throw error
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
      throw error
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
      throw error
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

    const customer = await this.prisma.client.customer.findFirst({
      where: { user: { id: userID } },
    })

    if (!!customer) {
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
      invoices.map(async invoice => ({
        ...this.formatInvoice(invoice),
        transactions: this.utils
          .filterErrors<Transaction>(
            await transactionsForCustomerLoader.load(customerId)
          )
          ?.filter(a => this.getInvoiceTransactionIds(invoice)?.includes(a.id))
          ?.map(this.formatTransaction),
      }))
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
  private formatInvoice = (invoice: Invoice) => {
    return {
      ...invoice,
      status: upperFirst(camelCase(invoice.status)),
      price: invoice.total,
      amount: invoice.total,
      closingDate: this.utils.secondsSinceEpochToISOString(invoice.date),
      dueDate: this.utils.secondsSinceEpochToISOString(invoice.dueDate, true),
      creditNotes: invoice.issuedCreditNotes.map(a => ({
        ...a,
        reasonCode: upperFirst(camelCase(a.reasonCode)),
        status: upperFirst(camelCase(a.status)),
        date: this.utils.secondsSinceEpochToISOString(a.date),
      })),
      lineItems: invoice.lineItems.map(a => ({
        ...a,
        entityType: upperFirst(camelCase(a.entityType)),
        price: a.amount,
        name: upperFirst(a.description),
        recordID: a.entityId,
        recordType: upperFirst(camelCase(a.entityType)),
        dateFrom: this.utils.secondsSinceEpochToISOString(a.dateFrom),
        dateTo: this.utils.secondsSinceEpochToISOString(a.dateTo),
      })),
    }
  }

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
