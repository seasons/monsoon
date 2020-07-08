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
  constructor(private readonly paymentService: PaymentService) {}

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
    await this.paymentService.chargebeeSubscriptionCreated(
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
    await this.paymentService.chargebeeCustomerChanged(id, card)
  }
}
