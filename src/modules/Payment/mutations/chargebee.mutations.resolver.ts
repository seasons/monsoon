import { Resolver, Args, Mutation } from "@nestjs/graphql"
import { PrismaClientService } from "../../../prisma/client.service"
import { Analytics } from "../../../nest_decorators"
import { PaymentService } from "../services/payment.service"

@Resolver()
export class ChargebeeMutationsResolver {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaClientService
  ) {}

  @Mutation()
  async acknowledgeCompletedChargebeeHostedCheckout(
    @Args() { hostedPageID },
    @Analytics() analytics,
  ) {

    const { customerId, userId, planId }: any = await this.paymentService.acknowledgeCompletedChargebeeHostedCheckout(hostedPageID)

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