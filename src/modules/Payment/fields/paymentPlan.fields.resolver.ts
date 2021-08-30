import { Customer } from "@app/decorators"
import { SubscriptionService } from "@app/modules/Payment/services/subscription.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PaymentPlan } from "@prisma/client"

interface Features {
  "access-monthly": string
  "access-yearly": string
}
interface FeaturesData {
  features: string[]
  strikeThroughFeatures: string[]
}

@Resolver("PaymentPlan")
export class PaymentPlanFieldsResolver {
  featuresData: FeaturesData
  constructor(
    private readonly subscription: SubscriptionService,
    private readonly utils: UtilsService
  ) {
    this.featuresData = this.utils.parseJSONFile(
      "src/modules/Payment/paymentPlanFeatures"
    )
  }

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
  async features(@Parent() parent) {
    return this.featuresData[parent.planID]
  }

  @ResolveField()
  async estimate(
    @Parent() paymentPlan: PaymentPlan,
    @Customer() customer,
    @Args() { couponID }
  ) {
    return this.subscription.subscriptionEstimate(
      paymentPlan,
      customer,
      couponID
    )
  }
}
