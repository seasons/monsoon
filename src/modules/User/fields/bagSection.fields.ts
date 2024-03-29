import {
  Application,
  ApplicationType,
} from "@app/decorators/application.decorator"
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
import { Prisma, ReservationPhysicalProductStatus } from "@prisma/client"
import { merge } from "lodash"

@Resolver("BagSection")
export class BagSectionFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async bagItems(
    @Context() context,
    @Parent() parent,
    @Select() select,
    @Application() application
  ) {
    if (!parent) {
      return null
    }

    if (parent.status === ReservationPhysicalProductStatus.Lost) {
      const customer = context.req.body.variables.where

      if (!customer) {
        return null
      }

      return await this.getLostItems(customer, select)
    } else if (
      parent.status === ReservationPhysicalProductStatus.DeliveredToBusiness &&
      application === "spring"
    ) {
      const customer = context.req.body.variables.where

      return await this.getSyntheticBagItemsFor({
        statuses: [
          ReservationPhysicalProductStatus.DeliveredToBusiness,
          // ReservationPhysicalProductStatus.ReturnProcessed,
        ],
        customer,
        select,
      })
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

  private async getSyntheticBagItemsFor({
    customer,
    statuses,
    select,
  }: {
    customer: { id: string }
    statuses: ReservationPhysicalProductStatus[]
    select?: Prisma.BagItemSelect
  }) {
    const rppArgs = select?.reservationPhysicalProduct as Prisma.ReservationPhysicalProductArgs
    const rppSelect = merge(
      {
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
      },
      rppArgs?.select
    )

    const items = await this.prisma.client.reservationPhysicalProduct.findMany({
      where: {
        customerId: customer.id,
        status: {
          in: statuses,
        },
      },
      select: rppSelect,
    })

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

    return items.map(wrapperBagItem)
  }

  private async getLostItems(
    customer: { id: string },
    select?: Prisma.BagItemSelect
  ) {
    return this.getSyntheticBagItemsFor({
      statuses: ["Lost"],
      customer,
      select,
    })
  }
}
