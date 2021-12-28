import "module-alias/register"

import { Prisma } from "@prisma/client"
import chargebee from "chargebee"
import { groupBy, uniq } from "lodash"

import { ErrorService } from "../../modules/Error/services/error.service"
import { RentalService } from "../../modules/Payment/services/rental.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const RENTAL_INVOICE_ARGS = Prisma.validator<
  Prisma.RentalInvoiceFindManyArgs
>()({
  select: {
    id: true,
    total: true,
    billingEndAt: true,
    status: true,
    lineItems: {
      select: { price: true },
    },
    membership: {
      select: {
        customer: {
          select: { user: { select: { id: true, email: true } } },
        },
      },
    },
    chargebeeInvoice: {
      select: { chargebeeId: true },
    },
  },
})

type RentalInvoiceForScript = Prisma.RentalInvoiceGetPayload<
  typeof RENTAL_INVOICE_ARGS
>

const timeService = new TimeUtilsService()

const run = async () => {
  const ps = new PrismaService()
  const error = new ErrorService()
  const utils = new UtilsService(ps)
  const shipping = new ShippingService(ps, utils)
  const rental = new RentalService(ps, timeService, error, shipping, utils)

  const billedRentalInvoicesForActiveCustomers = await ps.client.rentalInvoice.findMany(
    {
      where: {
        status: "Billed",
        membership: {
          customer: { status: { in: ["Active", "PaymentFailed"] } },
        },
        total: { gt: 0 },
      },
      select: RENTAL_INVOICE_ARGS.select,
      orderBy: { createdAt: "asc" },
    }
  )
  const invoicesWithoutChargebeeInvoice = billedRentalInvoicesForActiveCustomers.filter(
    a => !a.chargebeeInvoice
  )

  const chargebeeIDs = uniq(
    invoicesWithoutChargebeeInvoice.map(a => a.membership.customer.user.id)
  )

  const firstHalfIds = chargebeeIDs.slice(0, chargebeeIDs.length / 2)
  const secondHalfIds = chargebeeIDs.slice(chargebeeIDs.length / 2)

  const invoicesForFirstHalfIds = await getChargebeeInvoicesForCustomerIds(
    firstHalfIds
  )
  const invoicesForSecondHalfIds = await getChargebeeInvoicesForCustomerIds(
    secondHalfIds
  )

  const allInvoices = [...invoicesForFirstHalfIds, ...invoicesForSecondHalfIds]

  let i = 0

  const invoicesByCustomer = groupBy(
    invoicesWithoutChargebeeInvoice,
    a => a.membership.customer.user.id
  )

  for (const [userid, invoices] of Object.entries(invoicesByCustomer)) {
    const invoicesInDescendingOrderTotal = (invoices as RentalInvoiceForScript[]).sort(
      (a, b) => {
        return b.total - a.total
      }
    )
    let remainingChargebeeInvoicesForCustomer = allInvoices.filter(
      a => a.customer_id === userid
    )

    for (const rentalInvoice of invoicesInDescendingOrderTotal) {
      console.log(`processing ${i++}/${invoicesWithoutChargebeeInvoice.length}`)
      // const totalOnLineItems = rentalInvoice.lineItems.reduce(
      //   (acc, curval) => acc + curval.price,
      //   0
      // )
      // if (totalOnLineItems !== rentalInvoice.total) {
      //   await ps.client.rentalInvoice.update({
      //     where: { id: rentalInvoice.id },
      //     data: { total: totalOnLineItems },
      //   })
      // }

      // if (totalOnLineItems === 0) {
      //   continue
      // }

      const chargebeeInvoiceForRentalInvoice = findChargebeeInvoiceForRentalInvoice(
        rentalInvoice,
        remainingChargebeeInvoicesForCustomer
      )

      if (!!chargebeeInvoiceForRentalInvoice) {
        remainingChargebeeInvoicesForCustomer = remainingChargebeeInvoicesForCustomer.filter(
          a => a.id !== chargebeeInvoiceForRentalInvoice.id
        )
        const promises = []
        promises.push(
          rental.createLocalCopyOfChargebeeInvoice(
            chargebeeInvoiceForRentalInvoice
          ).promise
        )
        promises.push(
          ps.client.rentalInvoice.update({
            where: { id: rentalInvoice.id },
            data: {
              chargebeeInvoice: {
                connect: { chargebeeId: chargebeeInvoiceForRentalInvoice.id },
              },
            },
          })
        )
        await ps.client.$transaction(promises)
      }
    }
  }
}

const getChargebeeInvoicesForCustomerIds = async ids => {
  let offset = "start"
  const allInvoices = []
  while (true) {
    let list
    const listParams = {}
    listParams["customer_id[in]"] = `[${ids}]`
    ;({ next_offset: offset, list } = await chargebee.invoice
      .list({
        ...listParams,
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allInvoices.push(...list?.map(a => a["invoice"]))
    if (!offset) {
      break
    }
  }
  return allInvoices
}
const findChargebeeInvoiceForRentalInvoice = (
  rentalInvoice: RentalInvoiceForScript,
  chargebeeInvoices: {
    id: string
    date: number
    sub_total: number
    line_items: { amount: number; id: string }[]
  }[]
) => {
  let possibleInvoices = chargebeeInvoices.filter(a => {
    const invoiceCreatedAt = timeService.dateFromUTCTimestamp(a.date, "seconds")
    return timeService.isLaterDate(invoiceCreatedAt, rentalInvoice.billingEndAt)
  })

  const rentalInvoiceTotal = rentalInvoice.lineItems.reduce(
    (acc, curval) => acc + curval.price,
    0
  )

  possibleInvoices = possibleInvoices.filter(
    a => a.sub_total >= rentalInvoiceTotal
  )

  for (const possibleInvoice of possibleInvoices) {
    const lineItemsToCheck = rentalInvoice.lineItems.filter(a => a.price > 0)
    let allRentalInvoiceLineItemsOnChargebeeInvoice = true
    let remainingChargebeeLineItems = possibleInvoice.line_items

    for (const li of lineItemsToCheck) {
      if (remainingChargebeeLineItems.length === 0) {
        allRentalInvoiceLineItemsOnChargebeeInvoice = false
        break
      }

      const matchingChargebeeLineItem = remainingChargebeeLineItems.find(
        a => a.amount === li.price
      )
      if (!matchingChargebeeLineItem) {
        allRentalInvoiceLineItemsOnChargebeeInvoice = false
        break
      }

      remainingChargebeeLineItems = remainingChargebeeLineItems.filter(
        a => a.id !== matchingChargebeeLineItem.id
      )
    }

    if (!allRentalInvoiceLineItemsOnChargebeeInvoice) {
      continue
    } else {
      return possibleInvoice
    }
  }

  return null
}

run()
