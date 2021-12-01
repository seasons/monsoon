import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import {
  Args,
  Context,
  Parent,
  ResolveField,
  Resolver,
  Root,
} from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { merge } from "lodash"

@Resolver("BagSection")
export class BagSectionFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async bagItems(@Context() context, @Parent() parent, @Select() select) {
    if (!parent) {
      return null
    }

    if (parent.status === "Lost") {
      const customer = context.req.body.variables.where

      if (!customer) {
        return null
      }

      return this.getLostItems(customer, select)
    }

    return await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: parent.bagItems.map(b => b.id),
        },
      },
      select: merge(select, {
        id: true,
        status: true,
        updatedAt: true,
        physicalProduct: {
          select: {
            id: true,
          },
        },
      }),
    })
  }

  private async getLostItems(
    customer: { id: string },
    select?: Prisma.BagItemSelect
  ) {
    const rppArgs = select?.reservationPhysicalProduct as Prisma.ReservationPhysicalProductArgs
    const rppSelect = merge(
      Prisma.validator<Prisma.ReservationPhysicalProductSelect>()({
        id: true,
        createdAt: true,
        physicalProduct: merge(
          {
            select: {
              id: true,
              productVariant: merge(
                {
                  select: {
                    id: true,
                  },
                },
                select.productVariant
              ),
            },
          },
          select.physicalProduct
        ),
        customer: true,
      }),
      rppArgs?.select
    )

    const lostItems = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          customerId: customer.id,
          status: "Lost",
        },
        select: rppSelect,
      }
    )

    const wrapperBagItem = rpp => {
      return {
        id: rpp.id,
        createdAt: rpp.createdAt,
        updatedAt: rpp.updatedAt,
        status: "Reserved",
        reservationPhysicalProduct: rpp,
        physicalProduct: rpp.physicalProduct,
        productVariant: rpp.physicalProduct.productVariant,
        customer: rpp.customer,
        saved: false,
        position: 0,
      }
    }

    return lostItems.map(wrapperBagItem)
  }
}
