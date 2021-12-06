import "module-alias/register"

import { pick, uniqBy } from "lodash"
import { DateTime } from "luxon"
import { first } from "rxjs"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"
import {
  Prisma,
  ReservationPhysicalProductStatus,
  ReservationStatus,
} from ".prisma/client"

const ReservationArgs = Prisma.validator<Prisma.ReservationFindManyArgs>()({
  orderBy: { createdAt: "asc" },
  select: {
    id: true,
    createdAt: true,
    shippingMethod: { select: { id: true, code: true } },
    newProducts: { select: { seasonsUID: true } },
    status: true,
    products: { select: { seasonsUID: true } },
    returnedProducts: { select: { seasonsUID: true } },
    reservationNumber: true,
    returnPackages: {
      select: {
        id: true,
        items: { select: { seasonsUID: true } },
        deliveredAt: true,
        enteredDeliverySystemAt: true,
      },
    },
    sentPackage: {
      select: {
        id: true,
        items: { select: { seasonsUID: true } },
        enteredDeliverySystemAt: true,
        deliveredAt: true,
        toAddress: { select: { id: true, name: true, state: true } },
      },
    },
    cancelledAt: true,
    phase: true,
  },
})

type MigrateReservation = Prisma.ReservationGetPayload<typeof ReservationArgs>

const ProductArgs = Prisma.validator<Prisma.PhysicalProductArgs>()({
  select: {
    id: true,
    seasonsUID: true,
    productStatus: true,
    offloadNotes: true,
    offloadMethod: true,
    warehouseLocation: { select: { id: true } },
  },
})

type MigrateProduct = Prisma.PhysicalProductGetPayload<typeof ProductArgs>
const RentalInvoiceSelect = Prisma.validator<Prisma.RentalInvoiceSelect>()({
  id: true,
  status: true,
  membership: {
    select: {
      customer: {
        select: {
          id: true,
          user: { select: { email: true, lastName: true } },
          orders: {
            select: {
              createdAt: true,
              status: true,
              lineItems: {
                select: { recordID: true, recordType: true },
              },
            },
          },
          bagItems: {
            where: { status: "Reserved" },
            select: {
              id: true,
              physicalProduct: {
                select: { seasonsUID: true },
              },
            },
          },
        },
      },
    },
  },
  reservations: ReservationArgs,
  products: ProductArgs,
})

const RentalInvoiceArgs = Prisma.validator<Prisma.RentalInvoiceArgs>()({
  select: RentalInvoiceSelect,
})

type MigrateRentalInvoice = Prisma.RentalInvoiceGetPayload<
  typeof RentalInvoiceArgs
>

const resyIsPickup = async (
  resy: MigrateReservation,
  ri: MigrateRentalInvoice,
  ps: PrismaService
) => {
  const resyAdminLogs = await ps.client.adminActionLog.findMany({
    where: { entityId: resy.id, tableName: "Reservation" },
    select: {
      triggeredAt: true,
      changedFields: true,
    },
  })
  const markedAsDeliveredLog = resyAdminLogs.find(
    a => a.changedFields["status"] === "Delivered"
  )
  const isPickup = resy.shippingMethod?.code === "Pickup"
  const deliveryState = resy.sentPackage.toAddress.state.toLowerCase()
  const family = ["perlera"]
  const couldHaveBeenPickup =
    ["nj", "ny", "new york", "new jersey"].includes(deliveryState) ||
    family.includes(ri.membership.customer.user.lastName.toLowerCase())

  return {
    isPickup: !!markedAsDeliveredLog && (isPickup || couldHaveBeenPickup),
    pickedUpAt: markedAsDeliveredLog?.triggeredAt,
  }
}

const createReservationPhysicalProduct = async (
  ri: MigrateRentalInvoice,
  prod: MigrateProduct,
  ps: PrismaService,
  timeUtils: TimeUtilsService
) => {
  const existingRpp = await ps.client.reservationPhysicalProduct.findFirst({
    where: {
      physicalProduct: { seasonsUID: prod.seasonsUID },
      customer: { id: ri.membership.customer.id },
    },
  })
  if (existingRpp) {
    console.log(
      `RPP already exists for: ${prod.seasonsUID}, ${ri.membership.customer.user.email}`
    )
    return
  }
  const reservations = ri.reservations
  const allInboundPackages = uniqBy(
    ri.reservations.flatMap(a => a.returnPackages),
    a => a.id
  )

  let firstResy = reservations.find(a =>
    a.newProducts.some(b => b.seasonsUID === prod.seasonsUID)
  )
  if (!firstResy) {
    firstResy = await ps.client.reservation.findFirst({
      where: {
        newProducts: { some: { seasonsUID: prod.seasonsUID } },
        customer: { id: ri.membership.customer.id },
      },
      orderBy: { createdAt: "asc" },
      select: ReservationArgs.select,
    })
    if (!firstResy) {
      firstResy = await ps.client.reservation.findFirst({
        where: {
          products: { some: { seasonsUID: prod.seasonsUID } },
          customer: { id: ri.membership.customer.id },
        },
        orderBy: { createdAt: "asc" },
        select: ReservationArgs.select,
      })
    }
    if (!firstResy) {
      throw new Error(`No initial resy found for product ${prod.seasonsUID}`)
    }
  }

  /*
  If the first resy's outbound package never got shipped, the item may have been shipped on the sent package for 
  a later resy. Try to find that one. 
  */
  let shipmentResy = firstResy
  if (
    !firstResy.sentPackage.enteredDeliverySystemAt &&
    !firstResy.sentPackage.deliveredAt &&
    ["Completed", "ReturnPending"].includes(firstResy.status)
  ) {
    let candidateResy
    for (const a of reservations) {
      if (a.id === firstResy.id) {
        continue
      }

      const lessThanFourDaysLater =
        timeUtils.isLaterDate(a.createdAt, firstResy.createdAt) &&
        timeUtils.numDaysBetween(firstResy.createdAt, a.createdAt) <= 4
      const hasItem = a.products.some(b => b.seasonsUID === prod.seasonsUID)
      if (!lessThanFourDaysLater || !hasItem) {
        continue
      }
      const outboundPackageShipped =
        !!a.sentPackage.enteredDeliverySystemAt || !!a.sentPackage.deliveredAt
      const validUnshippedState = ([
        "Hold",
        "Cancelled",
        "Queued",
        "Picked",
        "Packed",
      ] as ReservationStatus[]).includes(a.status)

      if (outboundPackageShipped || validUnshippedState) {
        candidateResy = a
        break
      }

      const { isPickup } = await resyIsPickup(a, ri, ps)
      if (isPickup) {
        candidateResy = a
        break
      }
    }

    shipmentResy = candidateResy || firstResy
  }

  if (!shipmentResy) {
    throw new Error(`No shipment resy found for product ${prod.seasonsUID}`)
  }

  const outboundPackage = shipmentResy.sentPackage
  if (!outboundPackage) {
    throw new Error(`No outbound package found for product ${prod.seasonsUID}`)
  }

  const returnReceiptForItem = await ps.client.reservationReceipt.findFirst({
    where: {
      items: { some: { product: { seasonsUID: prod.seasonsUID } } },
      reservation: { customer: { id: ri.membership.customer.id } },
      createdAt: { gte: firstResy.createdAt },
    },
  })
  const hasReturnProcessed = !!returnReceiptForItem
  const returnProcessedAt = returnReceiptForItem?.createdAt

  const hasBeenLost = prod.productStatus === "Lost"

  const reservedBagItemForProd = ri.membership.customer.bagItems.find(
    a => a.physicalProduct.seasonsUID === prod.seasonsUID
  )
  if (!!reservedBagItemForProd && hasReturnProcessed) {
    throw new Error(
      `Product ${prod.seasonsUID} has already been returned but has a reserved bag item`
    )
  }

  // Either we have clear signal it's been delivered,
  // OR  it's been "a long time" (5 days) since it entered the delivery system and we haven't yet marked it as lost.
  // OR it's still reserved and the reservation was a long long (10 days) time ago
  // In the latter cases, we accept not storing a timestamp because billing code has a fallback in that case
  const outboundPackageDeliveredCleanly = !!outboundPackage.deliveredAt
  const outboundPackageDeliveredWithoutDeliveredAtSet =
    prod.productStatus !== "Lost" &&
    !!outboundPackage.enteredDeliverySystemAt &&
    timeUtils.numDaysBetween(
      outboundPackage.enteredDeliverySystemAt,
      new Date()
    ) > 5
  const outboundPackageDeliveredWithNoTimestampsSet =
    prod.productStatus !== "Lost" &&
    !!reservedBagItemForProd &&
    timeUtils.numDaysBetween(shipmentResy.createdAt, new Date()) > 5
  let hasBeenDeliveredToCustomer =
    outboundPackageDeliveredCleanly ||
    outboundPackageDeliveredWithoutDeliveredAtSet ||
    outboundPackageDeliveredWithNoTimestampsSet
  let deliveredToCustomerAt = outboundPackage.deliveredAt
  if (!hasBeenDeliveredToCustomer) {
    const { isPickup, pickedUpAt } = await resyIsPickup(shipmentResy, ri, ps)

    if (isPickup) {
      hasBeenDeliveredToCustomer = true
      deliveredToCustomerAt = pickedUpAt
    }
  }

  const hasBeenScannedOnOutbound =
    outboundPackage.enteredDeliverySystemAt !== null
  const scannedOnOutboundAt = outboundPackage.enteredDeliverySystemAt

  const inboundPackageWithItem = allInboundPackages.find(a =>
    a.items.some(b => b.seasonsUID === prod.seasonsUID)
  )
  const hasBeenDeliveredToBusiness =
    inboundPackageWithItem !== undefined || hasReturnProcessed
  const deliveredToBusinessAt = inboundPackageWithItem?.deliveredAt
  const hasBeenScannedOnInbound =
    !!inboundPackageWithItem &&
    inboundPackageWithItem?.enteredDeliverySystemAt !== null
  const scannedOnInboundAt = inboundPackageWithItem?.enteredDeliverySystemAt

  const itemSold = prod.offloadMethod === "SoldToUser"
  let purchasedAt
  if (itemSold) {
    const orderForCust = ri.membership.customer.orders?.find(
      a =>
        a.lineItems.some(b => b.recordID === prod.id) &&
        ["Fulfilled", "Submitted"].includes(a.status)
    )
    purchasedAt = orderForCust?.createdAt
  }

  let status: ReservationPhysicalProductStatus
  let cancelledAt
  if (purchasedAt) {
    status = "Purchased"
  } else if (
    ["Queued", "Picked", "Packed", "Cancelled"].includes(shipmentResy.status)
  ) {
    status = shipmentResy.status as ReservationPhysicalProductStatus
    if (shipmentResy.status === "Cancelled") {
      cancelledAt = shipmentResy.cancelledAt
    }
  } else if (shipmentResy.status === "Hold") {
    if (!!prod.warehouseLocation) {
      status = "Queued"
    } else {
      status = "Picked"
    }
  } else if (
    ["Shipped", "ReturnPending"].includes(shipmentResy.status) &&
    !!outboundPackage.enteredDeliverySystemAt &&
    !outboundPackage.deliveredAt
  ) {
    status = "InTransitOutbound"
  } else if (hasBeenDeliveredToCustomer && !hasBeenDeliveredToBusiness) {
    const moreThan24H =
      (!!deliveredToCustomerAt &&
        timeUtils.numDaysBetween(deliveredToCustomerAt, new Date()) > 1) ||
      (!!outboundPackage.enteredDeliverySystemAt &&
        timeUtils.numDaysBetween(
          outboundPackage.enteredDeliverySystemAt,
          new Date()
        ) > 6) ||
      timeUtils.numDaysBetween(shipmentResy.createdAt, new Date()) > 11
    if (moreThan24H) {
      status = "AtHome"
    } else {
      status = "DeliveredToCustomer"
    }
  } else if (hasBeenDeliveredToBusiness && !hasReturnProcessed) {
    status = "DeliveredToBusiness"
  } else if (
    hasBeenDeliveredToCustomer &&
    !hasBeenDeliveredToBusiness &&
    shipmentResy.returnedProducts.some(a => a.seasonsUID === prod.seasonsUID)
  ) {
    status = "ReturnPending"
  } else if (hasReturnProcessed) {
    status = "ReturnProcessed"
  } else if (hasBeenLost) {
    status = "Lost"
  } else if (
    shipmentResy.status === "Completed" &&
    !!shipmentResy.sentPackage.enteredDeliverySystemAt &&
    !shipmentResy.sentPackage.deliveredAt &&
    timeUtils.numDaysBetween(
      shipmentResy.sentPackage.enteredDeliverySystemAt,
      new Date()
    ) < 3
  ) {
    status = "InTransitOutbound"
  } else if (
    shipmentResy.status === "Shipped" &&
    shipmentResy.phase === "BusinessToCustomer"
  ) {
    status = "InTransitOutbound"
  } else {
    throw new Error(`Unable to determine status for product ${prod.seasonsUID}`)
  }

  /*
         pickedAt, packedAt -- we choose to leave out. We could theoretically query admin logs
         on the initial reservation to get these, but it's not worth the effort. 

         hasBeenResetEarlyByAdmin, resetEarlyByAdminAt -- No way to get this data.

         hasCustomerReturnIntent, customerReturnIntentAt -- We could theoretically get this data by 
            checking the returnedProducts array and status on a resy, but it's not worth the effort.

        lostAt, lostInPhase: no way to know
      */
  const createData: Prisma.ReservationPhysicalProductCreateInput = {
    isNew: true,
    physicalProduct: { connect: { id: prod.id } },
    customer: { connect: { id: ri.membership.customer.id } },
    reservation: { connect: { id: firstResy.id } },

    // Optional fields
    isOnHold: shipmentResy.status === "Hold",
    hasReturnProcessed,
    returnProcessedAt,
    hasBeenLost,
    hasBeenDeliveredToCustomer,
    deliveredToCustomerAt,
    hasBeenDeliveredToBusiness,
    deliveredToBusinessAt,
    hasBeenScannedOnOutbound,
    scannedOnOutboundAt,
    hasBeenScannedOnInbound,
    scannedOnInboundAt,
    ...(!!inboundPackageWithItem
      ? { inboundPackage: { connect: { id: inboundPackageWithItem?.id } } }
      : {}),
    outboundPackage: { connect: { id: outboundPackage.id } },
    rentalInvoices: { connect: { id: ri.id } },
    ...(!!firstResy.shippingMethod
      ? { shippingMethod: { connect: { id: shipmentResy.shippingMethod.id } } }
      : {}),
    ...(reservedBagItemForProd
      ? { bagItem: { connect: { id: reservedBagItemForProd.id } } }
      : {}),
    createdAt: firstResy.createdAt,
    status,
    cancelledAt,
    purchasedAt,
  }

  await ps.client.reservationPhysicalProduct.create({ data: createData })
}

const migrateToRpp = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const allBillableRentalInvoices = await ps.client.rentalInvoice.findMany({
    where: { status: { in: ["Draft", "ChargeFailed"] } },
    select: RentalInvoiceSelect,
    orderBy: { createdAt: "asc" },
  })

  let successCount = 0
  let failureCount = 0
  const total = allBillableRentalInvoices.flatMap(a => a.products).length
  let i = 0
  const ignoreList = [
    // Reserved by Perla but something wrong in the data. Let it be
    "ACNE-RED-LL-039-01",
  ]
  for (const ri of allBillableRentalInvoices) {
    const products = ri.products

    for (const prod of products) {
      console.log(`${i++} of ${total}`)
      if (ignoreList.includes(prod.seasonsUID)) {
        continue
      }
      try {
        await createReservationPhysicalProduct(ri, prod, ps, timeUtils)
        successCount++
      } catch (err) {
        failureCount++
        console.log(err)
      }
    }
  }

  console.log(`Successes: ${successCount}`)
  console.log(`Failures: ${failureCount}`)
  console.log(`Failure rate: ${(failureCount / total) * 100}%`)
}

migrateToRpp()
