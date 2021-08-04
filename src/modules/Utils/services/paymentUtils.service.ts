import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
import { get } from "lodash"
import { DateTime } from "luxon"
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2020-08-27",
})

@Injectable()
export class PaymentUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly segment: SegmentService
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
