import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Post } from "@nestjs/common"
import * as Sentry from "@sentry/node"
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
    private readonly prisma: PrismaService
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
      subscription: { customer_id, plan_id },
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
          user {
            id
            firstName
            lastName
            email
          }
        }
      `
      )
    )

    try {
      // If they don't have a billing info this means they've created their account
      // user the deprecated ChargebeeHostedCheckout
      if (!customerWithBillingAndUserData?.billingInfo?.id) {
        const user = customerWithBillingAndUserData.user
        this.segment.trackSubscribed(customer_id, {
          plan: this.payment.chargebeePlanIdToPrismaPlan(plan_id),
          method: "ChargebeeHostedCheckout",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
        })
        // Only create the billing info and send welcome email if user used chargebee checkout
        await this.payment.chargebeeSubscriptionCreated(
          customer_id,
          customer,
          card,
          plan_id
        )
      }
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  private async chargebeeCustomerChanged(content: any) {
    const {
      customer: { id },
      card,
    } = content
    await this.payment.chargebeeCustomerChanged(id, card)
  }
}
