import { Injectable } from "@nestjs/common"
import { Prisma, RentalInvoiceStatus } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
import { get } from "lodash"
import { DateTime } from "luxon"
import Stripe from "stripe"

import { TimeUtilsService } from "./time.service"

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
})

@Injectable()
export class PaymentUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService
  ) {}

  createBillingAddresses(user, token, billing) {
    let chargebeeBillingAddress
    let prismaBillingAddress

    if (billing) {
      // Ideally we pass the billing info from the form
      // some older Harvest builds didn't have the billing address included
      chargebeeBillingAddress = {
        first_name: billing.user.firstName || "",
        last_name: billing.user.lastName || "",
        ...billing.address,
        zip: billing.address.postal_code.toString() || "",
        country: "US", // assume its US for now, because we need it for taxes.
      }

      prismaBillingAddress = {
        postal_code: billing.address.postal_code.toString(),
        street1: billing.address.line1,
        street2: billing.address.line2,
        city: billing.address.city,
        state: billing.address.state,
        country: "US", // assume its US for now, because we need it for taxes.
      }
    } else {
      // We use the token data if no billing passed from form
      const tokenBillingAddressCity = token.card.addressCity || ""
      const tokenBillingAddress1 = token.card.addressLine1 || ""
      const tokenBillingAddress2 = token.card?.addressLine2 || ""
      const tokenBillingAddressState = token.card.addressState || ""
      const tokenBillingAddressZip = token.card.addressZip || ""
      const tokenBillingAddressCountry =
        token.card.addressCountry?.toUpperCase() || ""

      chargebeeBillingAddress = {
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        line1: tokenBillingAddress1,
        line2: tokenBillingAddress2,
        city: tokenBillingAddressCity,
        state: tokenBillingAddressState,
        zip: tokenBillingAddressZip,
        country: tokenBillingAddressCountry || "US",
      }

      prismaBillingAddress = {
        city: tokenBillingAddressCity,
        postal_code: tokenBillingAddressZip,
        state: tokenBillingAddressState,
        street1: tokenBillingAddress1,
        street2: tokenBillingAddress2,
        country: tokenBillingAddressCountry || "US",
      }
    }

    return { prismaBillingAddress, chargebeeBillingAddress }
  }

  getSubscriptionStartDate() {
    // Meant to be used when creating a chargebee subscription
    // If we're in a dev/staging environment, backdate their subscription by 29 days
    // so we can test billing code easily.
    const start_date =
      process.env.NODE_ENV !== "production"
        ? this.timeUtils.xDaysBeforeDate(new Date(), 29, "timestamp")
        : undefined
    return start_date
  }

  async createPaymentIntent(paymentMethodID, amountDue) {
    return await stripe.paymentIntents.create({
      payment_method: paymentMethodID,
      amount: amountDue,
      currency: "USD",
      confirm: true,
      confirmation_method: "manual",
      setup_future_usage: "off_session",
      capture_method: "manual",
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
    })
  }

  async updateResumeDate(date, customer) {
    const customerWithMembership = await this.prisma.client.customer.findUnique(
      {
        where: { id: customer.id },
        select: {
          id: true,
          membership: {
            select: {
              id: true,
              pauseRequests: {
                select: { id: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      }
    )

    const pauseRequest = customerWithMembership.membership?.pauseRequests?.[0]

    await this.prisma.client.pauseRequest.update({
      where: { id: pauseRequest?.id || "" },
      data: { resumeDate: date },
    })
  }

  createBillingInfoObject(card, chargebeeCustomer) {
    try {
      return {
        brand: card.card_type || card.brand,
        name: `${card.first_name || ""} ${card.last_name || ""}`,
        last_digits: card.last4,
        expiration_month: card.expiry_month,
        expiration_year: card.expiry_year,
        street1: chargebeeCustomer?.billing_address?.line1 || "",
        street2: chargebeeCustomer?.billing_address?.line2 || "",
        city: chargebeeCustomer?.billing_address?.city || "",
        state: chargebeeCustomer?.billing_address?.state || "",
        country: chargebeeCustomer?.billing_address?.country || "",
        postal_code: chargebeeCustomer?.billing_address?.zip || "",
      }
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  getCustomerMembershipSubscriptionData = subscription => ({
    nextBillingAt: !!subscription.next_billing_at
      ? DateTime.fromSeconds(subscription.next_billing_at).toISO()
      : null,
    currentTermEnd: DateTime.fromSeconds(subscription.current_term_end).toISO(),
    currentTermStart: DateTime.fromSeconds(
      subscription.current_term_start
    ).toISO(),
    status: subscription.status,
    planPrice: subscription.plan_amount,
    subscriptionId: subscription.id,
    planID: subscription.plan_id.replace("-gift", ""),
  })

  async movePromotionalCreditsToChargebee(
    prismaUserId: string,
    numCreditsToMove: number,
    mode: "Rental" | "Reservation",
    options: { rentalInvoiceId?: string } = {}
  ) {
    if (!numCreditsToMove) {
      return
    }

    let description
    let reason
    const rentalInvoiceId = options.rentalInvoiceId

    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: prismaUserId } },
      select: {
        membership: {
          select: {
            id: true,
            creditBalance: true,
            plan: {
              select: {
                planID: true,
              },
            },
          },
        },
      },
    })

    const existingCreditBalance = prismaCustomer.membership.creditBalance
    if (existingCreditBalance === 0) {
      return
    }

    if (mode === "Rental") {
      if (!rentalInvoiceId) {
        return
      }
      const rentalInvoice = await this.prisma.client.rentalInvoice.findUnique({
        where: { id: rentalInvoiceId },
        select: {
          creditsApplied: true,
        },
      })

      if (rentalInvoice.creditsApplied) {
        return
      }
      description = `(MONSOON_IGNORE) Grandfathered ${prismaCustomer.membership.plan.planID} credits applied towards rental charges`
      reason = "Transferred to chargebee to apply towards rental charges"
    } else if (mode === "Reservation") {
      description = `(MONSOON_IGNORE) ${prismaCustomer.membership.plan.planID} credits applied towards initial minimum charges`
      reason =
        "Transferred to chargebee to apply towards initial minimum charges"
    }

    let totalCreditsApplied

    if (numCreditsToMove > existingCreditBalance) {
      totalCreditsApplied = existingCreditBalance
    } else {
      totalCreditsApplied = numCreditsToMove
    }

    await chargebee.promotional_credit
      .add({
        customer_id: prismaUserId,
        amount: totalCreditsApplied,
        description,
      })
      .request()

    await this.prisma.client.customerMembership.update({
      where: { id: prismaCustomer.membership.id },
      data: {
        creditBalance: { decrement: totalCreditsApplied },
        creditUpdateHistory: {
          create: {
            amount: -1 * totalCreditsApplied,
            reason,
          },
        },
      },
    })

    if (rentalInvoiceId) {
      await this.prisma.client.rentalInvoice.update({
        where: { id: rentalInvoiceId },
        data: {
          creditsApplied: totalCreditsApplied,
        },
      })
    }
  }

  async getChargebeePaymentSource(userID: string) {
    const cardInfo: any = await new Promise((resolve, reject) => {
      // Get user's payment information from chargebee
      chargebee.payment_source
        .list({
          limit: 1,
          "customer_id[is]": userID,
          "type[is]": "card",
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            const card = get(result, "list[0].payment_source.card")
            if (!card) {
              reject("No card found for customer.")
            }
            resolve(card)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
    return cardInfo
  }
}
