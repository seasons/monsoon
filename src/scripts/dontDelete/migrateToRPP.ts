import "module-alias/register"

import { pick, uniqBy } from "lodash"
import { DateTime } from "luxon"
import { first } from "rxjs"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"
import { Prisma, ReservationPhysicalProductStatus } from ".prisma/client"

const ReservationSelect = Prisma.validator<Prisma.ReservationSelect>()({
  id: true,
  createdAt: true,
  shippingMethod: { select: { id: true } },
  newProducts: { select: { seasonsUID: true } },
  status: true,
  returnedProducts: { select: { seasonsUID: true } },
  sentPackage: {
    select: {
      id: true,
      enteredDeliverySystemAt: true,
      deliveredAt: true,
      items: { select: { seasonsUID: true } },
    },
  },
  returnPackages: {
    select: {
      id: true,
      items: { select: { seasonsUID: true } },
      deliveredAt: true,
      enteredDeliverySystemAt: true,
    },
  },
  receipt: {
    select: {
      createdAt: true,
      items: {
        select: { product: { select: { seasonsUID: true } } },
      },
    },
  },
})
const createReservationPhysicalProduct = async (
  ri,
  prod,
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
      select: ReservationSelect,
    })
    if (!firstResy) {
      throw new Error(`No initial resy found for product ${prod.seasonsUID}`)
    }
  }
  //   console.log(pick(prod, ["seasonsUID", "warehouseLocation"]))
  //   console.log(firstResy)

  const hasReturnProcessed =
    firstResy.receipt?.items.some(
      a => a.product.seasonsUID === prod.seasonsUID
    ) || false
  const returnProcessedAt = firstResy.receipt?.createdAt

  const hasBeenLost = prod.productStatus === "Lost"

  const reservedBagItemForProd = ri.membership.customer.bagItems.find(
    a => a.physicalProduct.seasonsUID === prod.seasonsUID
  )

  const outboundPackage = firstResy.sentPackage
  if (!outboundPackage.items.some(a => a.seasonsUID === prod.seasonsUID)) {
    throw new Error(
      `No outbound package item found for product ${prod.seasonsUID}`
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
    timeUtils.numDaysBetween(firstResy.createdAt, new Date()) > 10
  const hasBeenDeliveredToCustomer =
    outboundPackageDeliveredCleanly ||
    outboundPackageDeliveredWithoutDeliveredAtSet ||
    outboundPackageDeliveredWithNoTimestampsSet

  const deliveredToCustomerAt = outboundPackage.deliveredAt
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

  if (!!reservedBagItemForProd && hasReturnProcessed) {
    throw new Error(
      `Product ${prod.seasonsUID} has already been returned but has a reserved bag item`
    )
  }

  let status: ReservationPhysicalProductStatus
  if (["Queued", "Picked", "Packed"].includes(firstResy.status)) {
    status = firstResy.status as ReservationPhysicalProductStatus
  } else if (firstResy.status === "Hold") {
    if (!!prod.warehouseLocation) {
      status = "Queued"
    } else {
      status = "Picked"
    }
  } else if (
    firstResy.status === "Shipped" &&
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
      timeUtils.numDaysBetween(firstResy.createdAt, new Date()) > 11
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
    firstResy.returnedProducts.some(a => a.seasonsUID === prod.seasonsUID)
  ) {
    status = "ReturnPending"
  } else if (hasReturnProcessed) {
    status = "ReturnProcessed"
  } else if (hasBeenLost) {
    status = "Lost"
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
    isOnHold: firstResy.status === "Hold",
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
      ? { shippingMethod: { connect: { id: firstResy.shippingMethod.id } } }
      : {}),
    ...(reservedBagItemForProd
      ? { bagItem: { connect: { id: reservedBagItemForProd.id } } }
      : {}),
    createdAt: firstResy.createdAt,
    status,
  }

  await ps.client.reservationPhysicalProduct.create({ data: createData })
}

const migrateToRpp = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const allBillableRentalInvoices = await ps.client.rentalInvoice.findMany({
    where: { status: { in: ["Draft", "ChargeFailed"] } },
    select: {
      id: true,
      status: true,
      membership: {
        select: {
          customer: {
            select: {
              id: true,
              user: { select: { email: true } },
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
      reservations: {
        orderBy: { createdAt: "asc" },
        select: ReservationSelect,
      },
      products: {
        select: {
          id: true,
          seasonsUID: true,
          productStatus: true,
          warehouseLocation: { select: { id: true } },
        },
      },
    },
  })

  let successCount = 0
  let failureCount = 0
  for (const ri of allBillableRentalInvoices) {
    const products = ri.products

    for (const prod of products) {
      try {
        await createReservationPhysicalProduct(ri, prod, ps, timeUtils)
        successCount++
      } catch (err) {
        failureCount++
        console.error(err)
      }
    }
  }

  console.log(`Successes: ${successCount}`)
  console.log(`Failures: ${failureCount}`)
}

migrateToRpp()
