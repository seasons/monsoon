import "module-alias/register"

import { ErrorService } from "../../modules//Error/services/error.service"
import {
  ProcessableReservationPhysicalProductArgs,
  RentalService,
} from "../../modules/Payment/services/rental.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const rentalInvoiceTotalScript = async () => {
  const ps = new PrismaService()
  const timeService = new TimeUtilsService()
  const error = new ErrorService()
  const utils = new UtilsService(ps)
  const shipping = new ShippingService(ps, utils)
  const rs = new RentalService(ps, timeService, error, shipping)
  const date = new Date()

  const rentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Billed",
    },
    select: {
      id: true,
      billingStartAt: true,
      billingEndAt: true,
      status: true,
      membership: {
        select: {
          id: true,
          customer: true,
          customerId: true,
        },
      },
      membershipId: true,
      estimatedTotal: true,
      lineItems: true,
      reservationPhysicalProducts: {
        select: ProcessableReservationPhysicalProductArgs.select,
      },
    },
  })
  const promises = []
  for (const rentalInvoice of rentalInvoices) {
    if (rentalInvoice.lineItems.length > 0) {
      const total = rentalInvoice.lineItems.reduce((a, b) => a + b.price, 0)
      promises.push(
        ps.client.rentalInvoice.update({
          where: {
            id: rentalInvoice.id,
          },
          data: {
            total: total,
          },
        })
      )
    }
  }

  await ps.client.$transaction(promises)

  const updatedRentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Billed",
    },
    select: {
      total: true,
    },
  })
  console.log(updatedRentalInvoices)
}

rentalInvoiceTotalScript()

const rentalInvoiceLineItemTypes = async () => {
  const ps = new PrismaService()
  const timeService = new TimeUtilsService()
  const error = new ErrorService()
  const utils = new UtilsService(ps)
  const shipping = new ShippingService(ps, utils)
  const rs = new RentalService(ps, timeService, error, shipping)
  const date = new Date()

  const processingRentalInvoiceLineItems = await ps.client.rentalInvoiceLineItem.findMany(
    {
      where: {
        physicalProduct: null,
        comment: {
          contains: "processing",
        },
      },
      select: {
        id: true,
        type: true,
        price: true,
        name: true,
        comment: true,
      },
    }
  )
  console.dir(processingRentalInvoiceLineItems, { depth: null })
  console.log(processingRentalInvoiceLineItems.length)
  await ps.client.rentalInvoiceLineItem.updateMany({
    where: {
      id: {
        in: processingRentalInvoiceLineItems.map(a => a.id),
      },
    },
    data: {
      type: "Package",
    },
  })

  const processingRentalInvoiceLineItemsUpdated = await ps.client.rentalInvoiceLineItem.findMany(
    {
      where: {
        type: "ProcessingFee",
      },
      select: {
        id: true,
      },
    }
  )
  console.log(processingRentalInvoiceLineItemsUpdated.length)

  // const packageRentalInvoiceLineItems = await ps.client.rentalInvoiceLineItem.findMany(
  //   {
  //     where: {
  //       physicalProduct: null,
  //       comment: {
  //         contains: "package",
  //       },
  //     },
  //     select: {
  //       id: true,
  //       type: true,
  //       price: true,
  //       name: true,
  //       comment: true,
  //     },
  //   }
  // )

  // console.dir(packageRentalInvoiceLineItems, {depth: null})
  // console.log(packageRentalInvoiceLineItems.length)

  // await ps.client.rentalInvoiceLineItem.updateMany({
  //   where: {
  //     id:{
  //       in: packageRentalInvoiceLineItems.map(a => a.id)
  //     }
  //   },
  //   data: {
  //     type: "Package"
  //   }
  // })

  // const packageRentalInvoiceLineItemsUpdated = await ps.client.rentalInvoiceLineItem.findMany(
  //   {
  //     where: {
  //       type: "Package"
  //     },
  //     select: {
  //       id: true,
  //     },
  //   }
  // )

  // console.log(packageRentalInvoiceLineItemsUpdated.length)
}

rentalInvoiceLineItemTypes()
