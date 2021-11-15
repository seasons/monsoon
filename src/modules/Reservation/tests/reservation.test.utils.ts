import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import cuid from "cuid"

import { ReserveService } from "../services/reserve.service"
import { ReservationService } from ".."
import { BagItem, Customer, Reservation, ShippingCode } from ".prisma/client"

export const UPS_GROUND_FEE = 1000

@Injectable()
export class ReservationTestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservation: ReservationService,
    private readonly reserve: ReserveService,
    private readonly utils: UtilsService,
    private readonly test: TestUtilsService
  ) {}

  async addToBagAndReserveForCustomer({
    customer,
    numProductsToAdd,
    options,
  }: {
    customer: Customer
    numProductsToAdd: number
    options: { shippingCode?: ShippingCode }
  }): Promise<{ reservation: Reservation; bagItems: BagItem[] }> {
    const { shippingCode = "UPSGround" } = options
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
          data: {
            customer: { connect: { id: customer.id } },
            productVariant: { connect: { id: prodVar.id } },
            status: "Added",
            saved: false,
          },
        })
      )
    }

    const bagItemsToReserve = await this.prisma.client.bagItem.findMany({
      where: {
        customer: { id: customer.id },
        status: { in: ["Added", "Reserved"] },
        saved: false,
      },
      select: { productVariant: { select: { id: true } } },
    })
    const prodVarsToReserve = bagItemsToReserve.map(a => a.productVariant.id)
    const r = await this.reserve.reserveItems({
      // items: prodVarsToReserve,
      shippingCode,
      customer: customer as any,
      select: {
        reservationNumber: true,
        products: { select: { seasonsUID: true } },
        newProducts: { select: { seasonsUID: true } },
        sentPackage: { select: { id: true } },
        returnPackages: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            shippingLabel: { select: { trackingNumber: true } },
          },
        },
        shippingMethod: { select: { code: true } },
      },
    })
    const transactionID = cuid()
    const sentPackage = await this.prisma.client.package.create({
      data: {
        reservationOnSentPackage: {
          connect: {
            id: r.id,
          },
        },
        transactionID,
      },
    })
    const returnPackage = await this.prisma.client.package.create({
      data: {
        reservationOnReturnPackages: {
          connect: {
            id: r.id,
          },
        },
        transactionID,
      },
    })
    const setPackageAmount = async (packageId, amount) => {
      await this.prisma.client.package.update({
        where: { id: packageId },
        data: { amount },
      })
    }

    await setPackageAmount(sentPackage.id, UPS_GROUND_FEE)
    await setPackageAmount(returnPackage.id, UPS_GROUND_FEE)
    return {
      reservation: r,
      bagItems: createdBagItems,
    }
  }
}
