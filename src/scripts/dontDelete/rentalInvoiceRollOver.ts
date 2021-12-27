import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeService = new TimeUtilsService()

  const rentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.parse("2021-12-08 00:00:00.000")),
      },
      membership: {
        customer: {
          status: "Active",
        },
      },
      // status: "Billed",
    },
    select: {
      id: true,
      status: true,
      reservationPhysicalProducts: {
        select: {
          id: true,
        },
      },
      createdAt: true,
      billingStartAt: true,
      billingEndAt: true,
      billedAt: true,
      membership: {
        select: {
          id: true,
          rentalInvoices: { select: { id: true } },
          customer: {
            select: {
              id: true,
              status: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (rentalInvoices.length === 0) {
    console.log("no rental invoices")
    return
  }
  const rentalInvoicesForCustomersWithAtLeastTwoRentalInvoices = rentalInvoices.filter(
    a => a.membership.rentalInvoices.length > 1
  )
  const promises = []
  let count = 0

  for (const rentalInvoice of rentalInvoicesForCustomersWithAtLeastTwoRentalInvoices) {
    // console.log(rentalInvoice.membership.customer.status)
    const previousRentalInvoice = await ps.client.rentalInvoice.findFirst({
      where: {
        id: {
          not: {
            equals: rentalInvoice.id,
          },
        },
        membershipId: rentalInvoice.membership.id,
        createdAt: {
          lt: new Date(Date.parse("2021-12-08 00:00:00.000")),
        },
        status: { in: ["Billed", "ChargeFailed"] },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        billingEndAt: true,
        billingStartAt: true,
        status: true,
        reservationPhysicalProducts: {
          select: {
            id: true,
            reservationId: true,
            physicalProductId: true,
            status: true,
            createdAt: true,
            pickedAt: true,
            packedAt: true,
            customerReturnIntentAt: true,
            deliveredToBusinessAt: true,
            deliveredToCustomerAt: true,
            scannedOnInboundAt: true,
            scannedOnOutboundAt: true,
            returnProcessedAt: true,
            droppedOffAt: true,
            purchasedAt: true,
            cancelledAt: true,
            lostAt: true,
          },
        },
      },
    })
    // console.log('current rental invoice')
    // console.dir(rentalInvoice, {depth: null})
    if (!previousRentalInvoice) {
      continue
    }

    const previousRpps = previousRentalInvoice.reservationPhysicalProducts
    const missingRpps = []
    const currentRppIds = rentalInvoice.reservationPhysicalProducts.map(
      a => a.id
    )
    for (let rpp of previousRpps) {
      const lifecycleEnded = [
        "Lost",
        "Cancelled",
        "Purchased",
        "ReturnProcessed",
      ].includes(rpp.status)
      const onCurrentRentalInvoice = currentRppIds.includes(rpp.id)

      if (
        ["Lost", "ReturnProcessed"].includes(rpp.status) &&
        !onCurrentRentalInvoice
      ) {
        const relevantTimeStamps = {
          Lost: rpp.lostAt,
          ReturnProcessed: rpp.returnProcessedAt,
        }

        const wasHandledDuringCurrentRentalInvoice = !!relevantTimeStamps[
          rpp.status
        ]
          ? timeService.isLaterDate(
              relevantTimeStamps[rpp.status],
              rentalInvoice.createdAt
            )
          : false
        if (wasHandledDuringCurrentRentalInvoice) {
          missingRpps.push(rpp)
          continue
        }
      }

      if (!lifecycleEnded && !onCurrentRentalInvoice) {
        const order = await ps.client.order.findFirst({
          where: {
            status: {
              in: ["Fulfilled", "Submitted"],
            },
            customer: { id: rentalInvoice.membership.customer.id },
            lineItems: {
              some: {
                recordType: "PhysicalProduct",
                recordID: rpp.physicalProductId,
              },
            },
          },
          select: {
            id: true,
          },
        })
        // console.log('order',order)
        if (order) {
          continue
        }
        missingRpps.push(rpp)
      }
    }
    if (missingRpps.length > 0) {
      console.log(
        "\n\n",
        rentalInvoice.membership.customer.user.email,
        "'s rental invoice"
      )
      console.log("current rental invoice")
      console.dir(rentalInvoice, { depth: null })
      console.log("missing reservation physical products")
      console.dir(missingRpps, { depth: null })
      console.log("previous rental invoice")
      console.dir(previousRentalInvoice, { depth: null })
      count++

      console.log("DO NOT DO UPDATE")
      // await ps.client.rentalInvoice.update({
      //   where: {
      //     id: rentalInvoice.id,
      //   },
      //   data: {
      //     reservationPhysicalProducts: {
      //       connect: missingRpps.map(a => {
      //         return { id: a.id }
      //       }),
      //     },
      //   },
      // })
    }
  }
  // await ps.client.$transaction(promises)
  console.log(count)
  console.log("script end")
}

run()
