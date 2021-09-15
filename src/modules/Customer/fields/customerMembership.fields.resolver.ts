import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { CustomerMembership } from "@prisma/client"

@Resolver("CustomerMembership")
export class CustomerMembershipFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async adjustedCreditBalance(@Parent() parent: CustomerMembership) {
    // FIXME: update the logic in this field resolver to be their creditBalance - thirtyDayRentalFee ( from previous rentals )
    const membership = await this.prisma.client.customerMembership.findUnique({
      where: { id: parent.id },
      select: {
        id: true,
        creditBalance: true,
      },
    })
    return membership.creditBalance || 0
  }
}
