import { Customer } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { RentalService } from "@app/modules/Payment/services/rental.service"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { CustomerMembership, Prisma } from "@prisma/client"
import { head } from "lodash"

@Resolver("CustomerMembership")
export class CustomerMembershipFieldsResolver {
  constructor(private readonly rental: RentalService) {}

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
  async financeMetrics(
    @Parent() customerMembership: CustomerMembership,
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
        keyToDataRelationship: "OneToMany",
        select: Prisma.validator<Prisma.RentalInvoiceSelect>()({
          id: true,
          billingStartAt: true,
          billingEndAt: true,
          status: true,
          membership: true,
          membershipId: true,
          estimatedTotal: true,
          lineItems: true,
          reservationPhysicalProducts: {
            select: {
              id: true,
              outboundPackage: true,
              physicalProduct: true,
            },
          },
        }),
      },
    })
    rentalInvoiceLoader: PrismaDataLoader
  ) {
    const rentalInvoices = await rentalInvoiceLoader.load(customerMembership.id)

    const currentInvoice = head(rentalInvoices)

    const estimatedTotal = await this.rental.calculateCurrentBalance(
      currentInvoice.membership.customerId,
      {
        upTo: "billingEnd",
      }
    )

    const lineItems = await this.rental.createRentalInvoiceLineItems(
      currentInvoice,
      { upTo: "today" }
    )

    return currentInvoice
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
        keyToDataRelationship: "OneToMany",
      },
    })
    rentalInvoiceLoader: PrismaDataLoader
  ) {
    const rentalInvoices = await rentalInvoiceLoader.load(parent.id)
    return head(rentalInvoices)
  }

  @ResolveField()
  async currentBalance(@Parent() membership, @Customer() customer) {
    if (membership.currentBalance) {
      return membership.currentBalance
    }

    const currentBalance = await this.rental.calculateCurrentBalance(
      customer.id,
      { upTo: "today" }
    )
    return currentBalance
  }
}
