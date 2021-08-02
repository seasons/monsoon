import { Customer } from "@app/decorators"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PaymentPlan } from "@prisma/client"

@Resolver("PaymentPlan")
export class PaymentPlanFieldsResolver {
  constructor(private readonly payment: PaymentService) {}

  @ResolveField()
  async pauseWithItemsPrice(@Parent() paymentPlan: PaymentPlan) {
    const planID = paymentPlan.planID

    switch (planID) {
      case "essential": {
        return 4500
      }
      case "essential-2": {
        return 3500
      }
      case "essential-1": {
        return 2500
      }
      case "all-access": {
        return 4500
      }
      case "all-access-2": {
        return 3500
      }
      case "all-access-1": {
        return 1500
      }
      default: {
        return 4500
      }
    }
  }

  @ResolveField()
  async estimate(
    @Parent() paymentPlan: PaymentPlan,
    @Customer() customer,
    @Args() { couponID }
  ) {
    return this.payment.subscriptionEstimate(paymentPlan, customer, couponID)
  }
}
