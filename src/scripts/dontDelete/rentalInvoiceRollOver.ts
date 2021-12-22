import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

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
  const promises = []
  let count = 0

  for (const rentalInvoice of rentalInvoices) {
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
        status: "Billed",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
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
      if (
        !["Lost", "Cancelled", "Purchased", "ReturnProcessed"].includes(
          rpp.status
        ) &&
        !currentRppIds.includes(rpp.id)
      ) {
        const order = await ps.client.order.findFirst({
          where: {
            status: {
              in: ["Fulfilled", "Submitted"],
            },
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

      promises.push(
        ps.client.rentalInvoice.update({
          where: {
            id: rentalInvoice.id,
          },
          data: {
            reservationPhysicalProducts: {
              connect: missingRpps.map(a => {
                return { id: a.id }
              }),
            },
          },
        })
      )
    }
  }
  await ps.client.$transaction(promises)
  console.log(count)
  console.log("script end")
}

run()
