import { Analytics } from "@app/decorators"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { PaymentService } from "../services/payment.service"

@Resolver()
export class ChargebeeMutationsResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async acknowledgeCompletedChargebeeHostedCheckout(
    @Args() { hostedPageID },
    @Analytics() analytics
  ) {
    const {
      customerId,
      userId,
      planId,
    }: any = await this.paymentService.acknowledgeCompletedChargebeeHostedCheckout(
      hostedPageID
    )

    analytics.track({
      userId: userId,
      event: "Subscribed",
      properties: {
        plan: planId,
      },
    })

    // Return
    return {
      billingInfo: await this.prisma.client
        .customer({ id: customerId })
        .billingInfo(),
      plan: this.prisma.client.customer({ id: customerId }).plan(),
    }
  }
}
