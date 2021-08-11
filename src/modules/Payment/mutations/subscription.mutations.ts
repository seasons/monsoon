import { Customer } from "@app/decorators/customer.decorator"
import { User } from "@app/decorators/user.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { SubscriptionService } from "../services/subscription.service"

@Resolver()
export class SubscriptionMutationsResolver {
  constructor(
    private readonly email: EmailService,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly subscription: SubscriptionService,
    private readonly segment: SegmentService
  ) {}

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
  async pauseSubscription(
    @Args() { subscriptionID, pauseType, reasonID },
    @Customer() customer,
    @User() user
  ) {
    await this.subscription.pauseSubscription(
      subscriptionID,
      customer,
      pauseType,
      reasonID
    )
    const customerWithData = (await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { firstName: true, email: true, id: true } },
        membership: {
          select: {
            id: true,
            plan: {
              select: { id: true, tier: true, planID: true, itemCount: true },
            },
            pauseRequests: {
              select: {
                createdAt: true,
                resumeDate: true,
                pauseDate: true,
                pauseType: true,
              },
            },
          },
        },
        reservations: { select: { id: true, status: true, createdAt: true } },
      },
    })) as any
    await this.email.sendPausedEmail(customerWithData, false)

    const tier = customerWithData?.membership?.plan?.tier
    const planID = customerWithData?.membership?.plan?.planID

    this.segment.track(user.id, "Paused Subscription", {
      ...pick(user, ["firstName", "lastName", "email"]),
      planID,
      tier,
      pauseType,
    })

    return true
  }

  @Mutation()
  async removeScheduledPause(@Args() { subscriptionID }, @Customer() customer) {
    await this.subscription.removeScheduledPause(subscriptionID, customer)
    return true
  }
}
