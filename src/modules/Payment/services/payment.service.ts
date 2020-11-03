import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PaymentPlanTier, User } from "@app/prisma"
import { EmailService } from "@modules/Email/services/email.service"
import { AuthService } from "@modules/User/services/auth.service"
import { Injectable } from "@nestjs/common"
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
import { PaymentUtilsService } from "./payment.utils.service"

@Injectable()
export class PaymentService {
  constructor(
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly emailService: EmailService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly segment: SegmentService
  ) {}

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
      throw new Error(`Error updating to new plan: ${e}`)
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

      await chargebee.customer
        .update_billing_info(user.id, {
          billing_address: billingAddress,
        })
        .request()

      const subscriptions = await chargebee.subscription
        .list({
          plan_id: { in: [planID] },
          customer_id: { is: user.id },
        })
        .request()

      const subscription = head(subscriptions.list) as any

      await chargebee.subscription
        .update(subscription.subscription.id, {
          plan_id: planID,
          payment_method: {
            tmp_token: token.tokenId,
            type: tokenType ? tokenType : "apple_pay",
          },
        })
        .request()

      const last4 = token?.card?.last4
      const brand = token?.card?.brand
      const billingInfoID = billingInfo?.id

      await this.prisma.client.updateBillingInfo({
        where: { id: billingInfoID },
        data: { brand, last_digits: last4 },
      })
    } catch (e) {
      throw new Error(`Error updating your payment method ${e}`)
    }
  }

  async stripeTokenCheckout(planID, token, customer, tokenType, couponID) {
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

    const subscription = await chargebee.subscription
      .create_for_customer(chargebeeCustomer.customer.id, {
        plan_id: planID,
        coupon_ids: !!couponID ? [couponID] : [],
      })
      .request()

    const subscriptionID = subscription.subscription.id

    await this.createPrismaSubscription(
      user.id,
      subscription.customer,
      paymentSource.payment_source.card,
      planID,
      subscriptionID
    )

    this.segment.trackSubscribed(user.id, {
      tier: this.getPaymentPlanTier(planID),
      planID,
      method: "ApplePay",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  }

  async updateResumeDate(date, customer) {
    const customerWithMembership = await this.prisma.binding.query.customer(
      { where: { id: customer.id } },
      `
        {
          id
          membership {
            id
            pauseRequests(orderBy: createdAt_DESC) {
              id
            }
          }
        }
      `
    )

    const pauseRequest = customerWithMembership.membership?.pauseRequests?.[0]

    await this.prisma.client.updatePauseRequest({
      where: { id: pauseRequest?.id || "" },
      data: { resumeDate: date },
    })
  }

  async pauseSubscription(subscriptionId, customer) {
    try {
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
        pauseDate: pauseDateISO,
        resumeDate: resumeDateISO,
      })
    } catch (e) {
      throw new Error(`Error pausing subscription: ${e}`)
    }
  }

  async removeScheduledPause(subscriptionId, customer) {
    try {
      await chargebee.subscription
        .remove_scheduled_pause(subscriptionId, {
          pause_option: "end_of_term",
        })
        .request()
    } catch (e) {
      if (
        e?.api_error_code &&
        e?.api_error_code !== "invalid_state_for_request"
      ) {
        throw new Error(`Error removing scheduled pause: ${e}`)
      }
    }

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

    await this.prisma.client.updatePauseRequest({
      where: { id: pauseRequest.id },
      data: { pausePending: false },
    })
  }

  async resumeSubscription(subscriptionId, date, customer) {
    const resumeDate = !!date
      ? { specific_date: DateTime.fromISO(date).toSeconds() }
      : "immediately"

    const pauseRequest = head(
      await this.prisma.client.pauseRequests({
        where: {
          membership: {
            customer: {
              id: customer.id,
            },
          },
        },
      })
    )

    try {
      const result = await chargebee.subscription
        .resume(subscriptionId, {
          resume_option: resumeDate,
          unpaid_invoices_handling: "schedule_payment_collection",
        })
        .request()

      if (result) {
        await this.prisma.client.updatePauseRequest({
          where: { id: pauseRequest.id },
          data: { pausePending: false },
        })

        await this.prisma.client.updateCustomer({
          data: {
            status: "Active",
          },
          where: { id: customer.id },
        })
      }
    } catch (e) {
      if (
        e?.api_error_code &&
        e?.api_error_code === "payment_processing_failed"
      ) {
        // FIXME: Need to fix this status for with whatever field we're using in payment failed cases
        // await this.prisma.client.updatePauseRequest({
        //   where: { id: pauseRequest.id },
        //   data: { pausePending: false },
        // })
        // await this.prisma.client.updateCustomer({
        //   data: {
        //     status: "PaymentFailed",
        //   },
        //   where: { id: customer.id },
        // })
      }
      throw new Error(`Error resuming subscription: ${JSON.stringify(e)}`)
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

  async getHostedCheckoutPage(
    planId,
    userId,
    email,
    firstName,
    lastName,
    phoneNumber
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
          redirect_url: "https://seasons.nyc/chargebee-mobile-checkout-success",
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
    planID: string,
    subscriptionID: string
  ) {
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
      subscriptionId: subscriptionID,
      plan: { connect: { planID } },
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
