import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Post } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
import { head } from "lodash"

import { PaymentService } from "../services/payment.service"

export type ChargebeeEvent = {
  content: any
  event_type: string
}

const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed"
const CHARGEBEE_SUBSCRIPTION_CREATED = "subscription_created"

/**
 * DEPRECATED
 * These hooks were necesarry for the the chargebee client checkout webview
 */
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
    }
  }

  private async chargebeeSubscriptionCreated(content: any) {
    const {
      subscription: { customer_id, plan_id, id: subscriptionID },
      customer,
      card,
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
