import { Customer } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import {
  ProcessableRentalInvoice,
  ProcessableReservationPhysicalProductArgs,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { CustomerMembership, Prisma } from "@prisma/client"
import cuid from "cuid"
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
          membership: {
            select: {
              id: true,
              customer: true,
              customerId: true,
            },
          },
          membershipId: true,
          estimatedTotal: true,
          lineItems: true,
          reservationPhysicalProducts: {
            select: ProcessableReservationPhysicalProductArgs.select,
          },
        }),
      },
    })
    rentalInvoiceLoader: PrismaDataLoader
  ) {
    const financeMetrics = []
    const rentalInvoices = await rentalInvoiceLoader.load(customerMembership.id)

    if (rentalInvoices.length > 0) {
      const currentInvoice: any = head(rentalInvoices)
      if (currentInvoice.status !== "Draft") {
        return financeMetrics
      }
      financeMetrics.push(
        await this.createFinanceMetric(currentInvoice, "today")
      )
      financeMetrics.push(
        await this.createFinanceMetric(currentInvoice, "billingEnd")
      )
    }

    return financeMetrics
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

  private async createFinanceMetric(
    currentInvoice: ProcessableRentalInvoice,
    upTo: "today" | "billingEnd"
  ) {
    const financeMetric = {}
    financeMetric["id"] = cuid()
    upTo === "today"
      ? (financeMetric["name"] = "Current balance")
      : (financeMetric["name"] = "Estimated total")

    const lineItems = await this.rental.createRentalInvoiceLineItems(
      currentInvoice,
      {
        upTo,
      }
    )

    const physicalProducts = currentInvoice.reservationPhysicalProducts.map(
      a => a.physicalProduct
    )

    for (const lineItem of lineItems) {
      const physicalProductID = lineItem.physicalProduct?.connect?.id
      if (!physicalProductID) {
        continue
      }

      const matchPhysicalProduct = physicalProducts.find(
        a => a.id === physicalProductID
      )

      lineItem.name = matchPhysicalProduct.productVariant.product.name
    }

    financeMetric["lineItems"] = lineItems

    financeMetric["amount"] = await this.rental.calculateCurrentBalance(
      currentInvoice.membership.customerId,
      {
        upTo,
      }
    )

    return financeMetric
  }
}
