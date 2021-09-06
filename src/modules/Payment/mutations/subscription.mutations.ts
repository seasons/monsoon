import { Customer } from "@app/decorators/customer.decorator"
import { User } from "@app/decorators/user.decorator"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { SubscriptionService } from "../services/subscription.service"

@Resolver()
export class SubscriptionMutationsResolver {
  constructor(private readonly subscription: SubscriptionService) {}

  @Mutation()
  async changeCustomerPlan(@Args() { planID }, @Customer() customer) {
    await this.subscription.changeCustomerPlan(planID, customer)
    return true
  }

  @Mutation()
  async resumeSubscription(
    @Args() { subscriptionID, date },
    @Customer() customer
  ) {
    await this.subscription.resumeSubscription(subscriptionID, date, customer)
    return true
  }

  @Mutation()
  async pauseSubscription() {
    throw new Error("Pause deprecated")
  }

  @Mutation()
  async removeScheduledPause(@Args() { subscriptionID }, @Customer() customer) {
    await this.subscription.removeScheduledPause(subscriptionID, customer)
    return true
  }
}
