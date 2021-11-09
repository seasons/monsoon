import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import {
  Customer,
  PhysicalProduct,
  Prisma,
  RentalInvoiceLineItem,
  ReservationStatus,
  ShippingCode,
} from "@prisma/client"
import { merge } from "lodash"
import moment from "moment"

import { CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT } from "../../services/rental.service"

export const UPS_GROUND_FEE = 1000
export const UPS_SELECT_FEE = 2000
export const BASE_PROCESSING_FEE = 550

const DEFAULT_RESERVATION_ARGS = Prisma.validator<Prisma.ReservationArgs>()({
  select: {
    id: true,
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
export type TestReservation = Prisma.ReservationGetPayload<
  typeof DEFAULT_RESERVATION_ARGS
>

export type TestCustomerWithId = Pick<Customer, "id">
export type PrismaDateUpdateInput = Date | string | null
export type PrismaOption = { prisma: PrismaService }
export type TimeUtilsOption = { timeUtils: TimeUtilsService }

export const getCustWithData = async (
  testCustomer: TestCustomerWithId,
  {
    prisma,
    select = {},
  }: { prisma: PrismaService; select: Prisma.CustomerSelect }
): Promise<any> => {
  const defaultSelect = {
    membership: {
      select: {
        rentalInvoices: {
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        },
      },
    },
  }

  const mergedSelect = merge(defaultSelect, select)
  return await prisma.client.customer.findFirst({
    where: { id: testCustomer.id },
    select: mergedSelect,
  })
}

export const setCustomerSubscriptionStatus = async (
  testCustomer: TestCustomerWithId,
  status: string,
  { prisma }: PrismaOption
) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: { membership: { update: { subscription: { update: { status } } } } },
  })
}

// TODO: Refactor to use luxon
export const expectTimeToEqual = (time, expectedValue) => {
  if (!expectedValue) {
    expect(time).toBe(expectedValue)
  }
  expect(moment(time).format("ll")).toEqual(moment(expectedValue).format("ll"))
}

export const setCustomerSubscriptionNextBillingAt = async (
  testCustomer: TestCustomerWithId,
  nextBillingAt: PrismaDateUpdateInput,
  { prisma }: PrismaOption
) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: {
      membership: { update: { subscription: { update: { nextBillingAt } } } },
    },
  })
}

export const addToBagAndReserveForCustomer = async (
  testCustomer: TestCustomerWithId,
  numProductsToAdd: number,
  { prisma, reserveService }: PrismaOption & { reserveService: ReserveService },
  options: { shippingCode?: ShippingCode } = {}
) => {
  const { shippingCode = "UPSGround" } = options
  const reservedBagItems = await prisma.client.bagItem.findMany({
    where: {
      customer: { id: testCustomer.id },
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
    const nextProdVar = await prisma.client.productVariant.findFirst({
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
  for (const prodVar of reservableProdVars) {
    await prisma.client.bagItem.create({
      data: {
        customer: { connect: { id: testCustomer.id } },
        productVariant: { connect: { id: prodVar.id } },
        status: "Added",
        saved: false,
      },
    })
  }

  const r = await reserveService.reserveItems({
    shippingCode,
    customer: testCustomer as any,
    select: DEFAULT_RESERVATION_ARGS.select,
  })
  const priceForPackage =
    shippingCode === "UPSSelect" ? UPS_SELECT_FEE : UPS_GROUND_FEE
  await setPackageAmount(r.sentPackage.id, priceForPackage, { prisma })
  await setPackageAmount(r.returnPackages[0].id, priceForPackage, { prisma })
  return r
}

export const setPackageAmount = async (
  packageId,
  amount,
  { prisma }: PrismaOption
) => {
  await prisma.client.package.update({
    where: { id: packageId },
    data: { amount },
  })
}

export const setPackageCreatedAt = async (
  packageId,
  numDaysAgo: number,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const createdAt = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.package.update({
    where: { id: packageId },
    data: { createdAt },
  })
}

export const setReservationStatus = async (
  reservationId,
  status: ReservationStatus,
  { prisma }: PrismaOption
) => {
  await prisma.client.reservation.update({
    where: { id: reservationId },
    data: { status },
  })
}

export const setReservationCreatedAt = async (
  reservationId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const date = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservation.update({
    where: { id: reservationId },
    data: { createdAt: date },
  })
}

export const setPackageDeliveredAt = async (
  packageId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const deliveredAtDate = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.package.update({
    where: { id: packageId },
    data: { deliveredAt: deliveredAtDate },
  })
}

export const setPackageEnteredSystemAt = async (
  packageId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const date = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.package.update({
    where: { id: packageId },
    data: { enteredDeliverySystemAt: date },
  })
}

export const overridePrices = async (
  seasonsUIDs,
  prices,
  { prisma }: PrismaOption
) => {
  if (seasonsUIDs.length !== prices.length) {
    throw "must pass in same length arrays"
  }
  for (const [i, overridePrice] of prices.entries()) {
    const prodToUpdate = await prisma.client.product.findFirst({
      where: {
        variants: {
          some: {
            physicalProducts: {
              some: { seasonsUID: seasonsUIDs[i] },
            },
          },
        },
      },
    })
    await prisma.client.product.update({
      where: { id: prodToUpdate.id },
      data: { computedRentalPrice: overridePrice },
    })
  }
}

export const setCustomerPlanType = async (
  testCustomer: TestCustomerWithId,
  planID: "access-monthly" | "access-yearly",
  { prisma }: PrismaOption
) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: { membership: { update: { plan: { connect: { planID } } } } },
  })
}

export const createLineItemHash = (
  items: (Pick<RentalInvoiceLineItem, "name"> & {
    physicalProduct: Pick<PhysicalProduct, "seasonsUID">
  })[]
) =>
  items.reduce((acc, curVal) => {
    return {
      ...acc,
      [curVal.physicalProduct?.seasonsUID || curVal.name]: curVal,
    }
  }, {})

export const createProcessingObjectKey = (
  reservationNumber,
  type: "OutboundPackage" | "Pickup"
) => "Reservation-" + reservationNumber + "-" + type
