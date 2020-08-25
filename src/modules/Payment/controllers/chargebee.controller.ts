import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Body, Controller, Post } from "@nestjs/common"

import { PaymentService } from "../services/payment.service"

export type ChargebeeEvent = {
  content: any
  event_type: string
}

const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed"
const CHARGEBEE_SUBSCRIPTION_CREATED = "subscription_created"

@Controller("chargebee_events")
export class ChargebeeController {
  constructor(
    private readonly payment: PaymentService,
    private readonly segment: SegmentService
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

    this.segment.client.track({
      userId: customer_id, // chargebee customer id is our internal user id
      event: "Subscribed",
      properties: {
        plan: this.payment.chargebeePlanIdToPrismPlan(plan_id),
      },
    })
    await this.payment.chargebeeSubscriptionCreated(
      customer_id,
      customer,
      card,
      plan_id
    )
  }

  private async chargebeeCustomerChanged(content: any) {
    const {
      customer: { id },
      card,
    } = content
    await this.payment.chargebeeCustomerChanged(id, card)
  }
}
