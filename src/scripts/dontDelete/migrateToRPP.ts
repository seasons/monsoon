import "module-alias/register"

import { uniqBy } from "lodash"
import { DateTime } from "luxon"

import { PrismaService } from "../../prisma/prisma.service"
import { Prisma, ReservationPhysicalProductStatus } from ".prisma/client"

const createReservationPhysicalProduct = async (
  ri,
  prod,
  ps: PrismaService
) => {
  const reservations = ri.reservations
  const allInboundPackages = uniqBy(
    ri.reservations.flatMap(a => a.returnPackages),
    a => a.id
  )

  const firstResy = reservations.find(a =>
    a.newProducts.some(b => b.seasonsUID === prod.seasonsUID)
  )
  if (!firstResy) {
    throw new Error(`No initial resy found for product ${prod.seasonsUID}`)
  }

  const hasReturnProcessed = firstResy.receipt.items.some(
    a => a.product.seasonsUID === prod.seasonsUID
  )
  const returnProcessedAt = firstResy.receipt?.createdAt

  const hasBeenLost = prod.productStatus === "Lost"

  const outboundPackage = firstResy.sentPackage
  if (!outboundPackage.items.some(a => a.seasonsUID === prod.seasonsUID)) {
    throw new Error(
      `No outbound package item found for product ${prod.seasonsUID}`
    )
  }
  const hasBeenDeliveredToCustomer = outboundPackage.deliveredAt !== null
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
    inboundPackageWithItem?.enteredDeliverySystemAt !== null
  const scannedOnInboundAt = inboundPackageWithItem?.enteredDeliverySystemAt

  const reservedBagItemForProd = ri.membership.customer.bagItems.find(
    a => a.physicalProduct.seasonsUID === prod.seasonsUID
  )

  let status: ReservationPhysicalProductStatus
  if (["Queued", "Picked", "Packed"].includes(firstResy.status)) {
    status = firstResy.status as ReservationPhysicalProductStatus
  } else if (
    firstResy.status === "Shipped" &&
    !!outboundPackage.enteredDeliverySystemAt &&
    !outboundPackage.deliveredAt
  ) {
    status = "InTransitOutbound"
  } else if (hasBeenDeliveredToCustomer && !hasBeenDeliveredToBusiness) {
    const date = deliveredToCustomerAt?.toISOString()
    const moreThan24H =
      // @ts-ignore
      DateTime.fromISO(date).diffNow("days")?.values?.days <= -1
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
    inboundPackage: { connect: { id: inboundPackageWithItem?.id } },
    outboundPackage: { connect: { id: outboundPackage.id } },
    rentalInvoices: { connect: { id: ri.id } },
    shippingMethod: { connect: { id: firstResy.shippingMethod.id } },
    ...(reservedBagItemForProd
      ? { bagItem: { connect: { id: reservedBagItemForProd.id } } }
      : {}),
    createdAt: firstResy.createdAt,
    status,
  }

  await ps.client.reservationPhysicalProduct.create({ data: createData })
}

// TODO: Before running this, cancel out rental invoices for deactivated customers
const migrateToRpp = async () => {
  const ps = new PrismaService()

  const allBillableRentalInvoices = await ps.client.rentalInvoice.findMany({
    where: { status: { in: ["Draft", "ChargeFailed"] } },
    select: {
      id: true,
      membership: {
        select: {
          customer: {
            select: {
              id: true,
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
        select: {
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
        },
      },
      products: { select: { id: true, seasonsUID: true, productStatus: true } },
    },
  })

  let successCount = 0
  let failureCount = 0
  for (const ri of allBillableRentalInvoices) {
    const products = ri.products

    for (const prod of products) {
      try {
        await createReservationPhysicalProduct(ri, prod, ps)
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
