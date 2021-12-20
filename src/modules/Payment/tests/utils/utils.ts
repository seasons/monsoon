import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import {
  Customer,
  PhysicalProduct,
  Prisma,
  RentalInvoiceLineItem,
  ReservationDropOffAgent,
  ReservationPhysicalProductStatus,
  ReservationStatus,
  ShippingCode,
} from "@prisma/client"
import { merge } from "lodash"
import moment from "moment"

import {
  ProcessableRentalInvoiceArgs,
  ProcessableReservationPhysicalProductArgs,
} from "../../services/rental.service"

export const UPS_GROUND_FEE = 1000
export const UPS_SELECT_FEE = 2000
export const BASE_PROCESSING_FEE = 550

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
          select: ProcessableRentalInvoiceArgs.select,
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

export const setReservationPhysicalProductDeliveredToCustomerAt = async (
  reservationPhysicalProductId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const deliveredAt = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: {
      deliveredToCustomerAt: deliveredAt,
      hasBeenDeliveredToCustomer: true,
    },
  })
}
export const setReservationPhysicalProductDeliveredToBusinessAt = async (
  reservationPhysicalProductId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const deliveredAt = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: {
      deliveredToBusinessAt: deliveredAt,
      hasBeenDeliveredToBusiness: true,
    },
  })
}

export const setReservationPhysicalProductScannedOnInboundAt = async (
  reservationPhysicalProductId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const scannedAt = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: {
      scannedOnInboundAt: scannedAt,
      hasBeenScannedOnInbound: true,
    },
  })
}

export const setReservationPhysicalProductScannedOnOutboundAt = async (
  reservationPhysicalProductId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const scannedAt = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: {
      scannedOnOutboundAt: scannedAt,
      hasBeenScannedOnOutbound: true,
    },
  })
}

export const setReservationPhysicalProductReturnProcessedAt = async (
  reservationPhysicalProductId,
  numDaysAgo,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const processedAt = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: {
      returnProcessedAt: processedAt,
      hasReturnProcessed: true,
    },
  })
}

export const setReservationPhysicalProductDroppedOffAt = async (
  reservationPhysicalProductId,
  numDaysAgo,
  agent: ReservationDropOffAgent,
  { prisma, timeUtils }: PrismaOption & TimeUtilsOption
) => {
  const timestamp = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: {
      droppedOffAt: timestamp,
      droppedOffBy: agent,
    },
  })
}

export const setReservationPhysicalProductStatus = async (
  reservationPhysicalProductId,
  status: ReservationPhysicalProductStatus,
  { prisma }: PrismaOption
) => {
  await prisma.client.reservationPhysicalProduct.update({
    where: { id: reservationPhysicalProductId },
    data: { status },
  })
}
