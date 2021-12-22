import "module-alias/register"

import { UniqueArgumentNames } from "graphql/validation/rules/UniqueArgumentNames"
import { uniq } from "lodash"
import { DateTime } from "luxon"

import { ErrorService } from "../../modules//Error/services/error.service"
import {
  ProcessableReservationPhysicalProductArgs,
  RentalService,
} from "../../modules/Payment/services/rental.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeService = new TimeUtilsService()
  const error = new ErrorService()
  const utils = new UtilsService(ps)
  const shipping = new ShippingService(ps, utils)
  const rs = new RentalService(ps, timeService, error, shipping)
  const date = new Date()

  // const rentalInvoiceLineItems = ps.client.rentalInvoiceLineItem.findMany({
  //   select:{
  //     id: true,
  //     comment: true,
  //     physicalProduct: true,
  //     name: true,
  //   }
  // })

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
      status: "Billed",
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
  for (const rentalInvoice of rentalInvoices) {
    console.log(rentalInvoice.membership.customer.status)
    const previousRentalInvoice = await ps.client.rentalInvoice.findFirst({
      where: {
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
        missingRpps.push(rpp)
      }
    }
    if (missingRpps.length > 0) {
      console.log("current rental invoice")
      console.dir(rentalInvoice, { depth: null })
      console.log("missing reservation physical products")
      console.dir(missingRpps, { depth: null })
      console.log("previous rental invoice")
      console.dir(previousRentalInvoice, { depth: null })

      // promises.push(
      //   ps.client.rentalInvoice.update({
      //     where:{
      //       id: rentalInvoice.id
      //     },
      //     data:{
      //       reservationPhysicalProducts: {
      //         connect:
      //           missingRpps.map(a => {return {id: a.id}})
      //       }
      //     }
      //   })
      // )
    }
  }
  ps.client.$transaction(promises)
  console.log("script end")
}

run()
