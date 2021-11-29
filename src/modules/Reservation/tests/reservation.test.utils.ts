import { ProcessableReservationPhysicalProductSelect } from "@app/modules/Payment/services/rental.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { merge } from "lodash"

import { ReserveService } from "../services/reserve.service"
import { BagItem, Customer, Prisma, ShippingCode } from ".prisma/client"

export const UPS_GROUND_FEE = 1000

const DEFAULT_RESERVATION_ARGS = Prisma.validator<Prisma.ReservationArgs>()({
  select: {
    id: true,
    reservationNumber: true,
    reservationPhysicalProducts: {
      select: ProcessableReservationPhysicalProductSelect,
    },
    shippingMethod: { select: { code: true } },
  },
})
export type TestReservation = Prisma.ReservationGetPayload<
  typeof DEFAULT_RESERVATION_ARGS
>
@Injectable()
export class ReservationTestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeUtils: TimeUtilsService,
    private readonly reserve: ReserveService
  ) {}

  async addToBagAndReserveForCustomer({
    customer,
    numProductsToAdd,
    options = {},
  }: {
    customer: Customer
    numProductsToAdd: number
    options?: {
      shippingCode?: ShippingCode
      numDaysAgo?: number
      bagItemCreateData?: Prisma.BagItemCreateInput
      bagItemSelect?: Prisma.BagItemSelect
    }
  }): Promise<{
    reservation: TestReservation
    bagItems: (BagItem & { [key: string]: any })[]
  }> {
    const { shippingCode = "UPSGround", numDaysAgo = 0 } = options
    const reservedBagItems = await this.prisma.client.bagItem.findMany({
      where: {
        customer: { id: customer.id },
        status: "Reserved",
        saved: false,
      },
      select: {
        productVariant: {
          select: { sku: true, product: { select: { id: true } } },
        },
      },
    })
    const reservedSKUs = reservedBagItems.map(a => a.productVariant.sku)
    const reservedProductIds = reservedBagItems.map(
      b => b.productVariant.product.id
    )
    let reservableProdVars = []
    let reservableProductIds = []
    for (let i = 0; i < numProductsToAdd; i++) {
      const nextProdVar = await this.prisma.client.productVariant.findFirst({
        where: {
          reservable: { gte: 1 },
          sku: { notIn: reservedSKUs },
          // Ensure we reserve diff products each time. Needed for some tests
          product: {
            id: { notIn: [...reservedProductIds, ...reservableProductIds] },
          },
          // We shouldn't need to check this since we're checking counts,
          // but there's some corrupt data so we do this to circumvent that.
          physicalProducts: { some: { inventoryStatus: "Reservable" } },
        },
        take: numProductsToAdd,
        select: {
          id: true,
          productId: true,
        },
      })
      reservableProdVars.push(nextProdVar)
      reservableProductIds.push(nextProdVar.productId)
    }

    let createdBagItems = []
    for (const prodVar of reservableProdVars) {
      createdBagItems.push(
        await this.prisma.client.bagItem.create({
          data: merge(
            {
              customer: { connect: { id: customer.id } },
              productVariant: { connect: { id: prodVar.id } },
              status: "Added",
              saved: false,
            },
            options?.bagItemCreateData
          ),
          ...(options?.bagItemSelect ? { select: options?.bagItemSelect } : {}),
        })
      )
    }

    const r = await this.reserve.reserveItems({
      shippingCode,
      ...(shippingCode === "Pickup"
        ? { pickupTime: { date: new Date().toISOString() } }
        : {}),
      customer,
      select: DEFAULT_RESERVATION_ARGS.select,
    })

    if (numDaysAgo > 0) {
      await this.prisma.client.reservation.update({
        where: { id: r.id },
        data: {
          createdAt: this.timeUtils.xDaysAgoISOString(numDaysAgo),
          reservationPhysicalProducts: {
            updateMany: {
              where: {
                id: { in: r.reservationPhysicalProducts.map(a => a.id) },
              },
              data: { createdAt: this.timeUtils.xDaysAgoISOString(numDaysAgo) },
            },
          },
        },
      })
    }
    return {
      reservation: r,
      bagItems: createdBagItems,
    }
  }
}
