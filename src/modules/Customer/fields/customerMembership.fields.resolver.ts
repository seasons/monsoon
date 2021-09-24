import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { CustomerMembership, Prisma } from "@prisma/client"

@Resolver("CustomerMembership")
export class CustomerMembershipFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async adjustedCreditBalance(
    @Parent() parent: CustomerMembership,
    @Loader({
      params: {
        model: "CustomerMembership",
        select: Prisma.validator<Prisma.CustomerMembershipSelect>()({
          id: true,
          creditBalance: true,
        }),
      },
    })
    prismaLoader: PrismaDataLoader
  ) {
    // FIXME: update the logic in this field resolver to be their creditBalance - thirtyDayRentalFee ( from previous rentals )
    const membership = await prismaLoader.load(parent.id)
    return membership.creditBalance || 0
  }

  @ResolveField()
  async currentRentalInvoice(
    @Parent() parent: CustomerMembership,
    @Loader({
      name: PrismaLoader.name,
      params: {
        model: "RentalInvoice",
        formatWhere: keys =>
          Prisma.validator<Prisma.RentalInvoiceWhereInput>()({
            membership: {
              id: {
                in: keys,
              },
            },
          }),
        getKeys: a => {
          return [a.membershipId]
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    })
    rentalInvoiceLoader: PrismaDataLoader
  ) {
    return await rentalInvoiceLoader.load(parent.id)
  }
}
