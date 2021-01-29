import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Post } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
import { head, pick } from "lodash"

import { PaymentService } from "../services/payment.service"

export type ChargebeeEvent = {
  content: any
  event_type: string
}

// For a full list of webhook types, see https://apidocs.chargebee.com/docs/api/events#event_types
const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed"
const CHARGEBEE_SUBSCRIPTION_CREATED = "subscription_created"
const CHARGEBEE_PAYMENT_SUCCEEDED = "payment_succeeded"

@Controller("chargebee_events")
export class ChargebeeController {
  constructor(
    private readonly payment: PaymentService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly email: EmailService,
    private readonly utils: UtilsService
  ) {}

  @Post()
  async handlePost(@Body() body: ChargebeeEvent) {
    switch (body.event_type) {
      case CHARGEBEE_SUBSCRIPTION_CREATED:
        await this.chargebeeSubscriptionCreated(body.content)
        break
      case CHARGEBEE_CUSTOMER_CHANGED:
        await this.chargebeeCustomerChanged(body.content)
        break
      case CHARGEBEE_PAYMENT_SUCCEEDED:
        await this.chargebeePaymentSucceeded(body.content)
        break
    }
  }

  private async chargebeePaymentSucceeded(content: any) {
    const { subscription, customer, transaction } = content
    const custWithData: any = head(
      await this.prisma.binding.query.customers(
        { where: { user: { id: customer.id } } },
        `
        {
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
    )
    this.segment.track(customer.id, "Completed Transaction", {
      ...pick(custWithData.user, ["firstName", "lastName", "email"]),
      transactionID: transaction.id,
      ...(!!subscription
        ? { coupons: subscription.coupons, subscriptionID: subscription.id }
        : {}),
      paymentMethod: transaction.payment_method,
      gateway: transaction.gateway,
      transactionType: transaction.type,
      amount: transaction.amount,
      impactId: custWithData.detail?.impactId,
      currency: "USD",
      total: transaction.amount,
      impactCustomerStatus: "Returning",
      ...this.utils.formatUTMForSegment(custWithData.utm),
    })
  }

  private async chargebeeSubscriptionCreated(content: any) {
    const {
      subscription: { customer_id, plan_id, id: subscriptionID },
      customer,
      card,
      invoice: { total },
    } = content

    const customerWithBillingAndUserData: any = head(
      await this.prisma.binding.query.customers(
        { where: { user: { id: customer_id } } },
        `
        {
          id
          billingInfo {
            id
          }
          detail {
            id
            impactId
          }
          utm {
            source
            medium
            campaign
            term
            content
          }
          user {
            id
            firstName
            lastName
            email
          }
          referrer {
            id
            user {
              id
              email
              firstName
            }
            membership {
              subscriptionId
            }
          }
        }
      `
      )
    )

    try {
      // If they don't have a billing info this means they've created their account
      // using the deprecated ChargebeeHostedCheckout
      if (!customerWithBillingAndUserData?.billingInfo?.id) {
        const user = customerWithBillingAndUserData.user
        this.segment.trackSubscribed(customer_id, {
          tier: this.payment.getPaymentPlanTier(plan_id),
          planID: plan_id,
          method: "ChargebeeHostedCheckout",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          impactId: customerWithBillingAndUserData.detail?.impactId,
          total,
          ...this.utils.formatUTMForSegment(customerWithBillingAndUserData.utm),
        })
        // Only create the billing info and send welcome email if user used chargebee checkout
        await this.payment.createPrismaSubscription(
          customer_id,
          customer,
          card,
          plan_id,
          subscriptionID
        )

        // Handle if it was a referral
        if (customerWithBillingAndUserData?.referrer?.id) {
          // Give the referrer a discount
          await chargebee.subscription
            .update(
              customerWithBillingAndUserData?.referrer?.membership
                ?.subscriptionId,
              {
                coupon_ids: [process.env.REFERRAL_COUPON_ID],
              }
            )
            .request()
          // Email the referrer
          await this.email.sendReferralConfirmationEmail({
            referrer: customerWithBillingAndUserData.referrer.user,
            referee: customerWithBillingAndUserData.user,
          })
        }
      }
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  private async chargebeeCustomerChanged(content: any) {
    const {
      customer: { id },
      card = {},
    } = content

    // no card data on the payload
    if (Object.keys(card).length > 0) {
      await this.payment.chargebeeCustomerChanged(id, card)
    } else {
      this.error.setExtraContext(content, "chargebeePayload.content")
      this.error.captureMessage(
        `Chargebee customer_changed payload without card in content`
      )
    }
  }
}
