import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import chargebee from "chargebee"
import open from "open"
import readlineSync from "readline-sync"

import { AppModule } from "../../app.module"
import {
  ProcessableRentalInvoiceArgs,
  RentalService,
} from "../../modules/Payment/services/rental.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const rental = app.get(RentalService)
  const ps = app.get(PrismaService)
  const timeUtils = app.get(TimeUtilsService)

  const ids = []
  const invoices = await ps.client.rentalInvoice.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      chargebeeInvoice: { select: { chargebeeId: true } },
      lineItems: {
        select: {
          price: true,
          name: true,
          // comment: true,
          physicalProduct: {
            select: {
              productVariant: {
                select: { product: { select: { name: true } } },
              },
            },
          },
        },
      },
      billingStartAt: true,
      billingEndAt: true,
      status: true,
      billedAt: true,
      membership: {
        select: {
          customer: { select: { user: { select: { email: true, id: true } } } },
        },
      },
    },
  })

  const unreconciledInvoices = invoices.filter(
    a => !a.chargebeeInvoice && a.status !== "ChargePending"
  )
  const targetUserIds = unreconciledInvoices.map(
    a => a.membership.customer.user.id
  )

  const chargebeeInvoices = await getChargebeeInvoicesForCustomerIds(
    targetUserIds
  )
  const chargebeeCustomers = await getChargebeeCustomersForCustomerIds(
    targetUserIds
  )

  console.log(`Unreconciled invoices: ${unreconciledInvoices.length}`)
  let i = 0
  for (const ri of unreconciledInvoices) {
    console.log(`${i++}/${unreconciledInvoices.length}`)

    const chargebeeInvoicesForCustomer = chargebeeInvoices.filter(
      a => a.customer_id === ri.membership.customer.user.id
    )
    chargebeeInvoicesForCustomer.sort((invoice1, invoice2) => {
      // We want the latest invoice to be first
      if (invoice1.date > invoice2.date) {
        return -1
      }
      return 1
    })

    const chargebeeCustomer = chargebeeCustomers.find(
      a => a.id === ri.membership.customer.user.id
    )

    const latestInvoice = chargebeeInvoicesForCustomer[0]
    const latestInvoiceDate = timeUtils.dateFromUTCTimestamp(
      latestInvoice.date,
      "seconds"
    )
    const rentalInvoiceBilledAfterLatestInvoice = timeUtils.isLaterDate(
      ri.billingEndAt,
      latestInvoiceDate
    )
    const lastInvoiceWasOnlyAPlanCharge =
      latestInvoice.line_items.length === 1 &&
      latestInvoice.line_items[0].entity_type === "plan"

    const rentalInvoiceBilledAfterLatestInvoiceWithNoBilledCharges =
      rentalInvoiceBilledAfterLatestInvoice &&
      chargebeeCustomer.unbilled_charges === 0
    const lastInvoiceWasPurePlanChargeWithNoBilledCharges =
      lastInvoiceWasOnlyAPlanCharge && chargebeeCustomer.unbilled_charges === 0

    let shouldProceed =
      rentalInvoiceBilledAfterLatestInvoiceWithNoBilledCharges ||
      lastInvoiceWasPurePlanChargeWithNoBilledCharges

    if (!shouldProceed) {
      console.dir(ri, { depth: null })
      console.log(`Latest invoice date: ${latestInvoiceDate}`)
      console.log(
        `Rental invoice billed after latest invoice: ${rentalInvoiceBilledAfterLatestInvoice}`
      )
      console.log(
        `Unbilled charges on chargebee: ${chargebeeCustomer.unbilled_charges}`
      )
      const chargebeeLink = `https://seasons.chargebee.com/customers?view_code=all&Customers.search=${ri.membership.customer.user.email}`
      console.log(chargebeeLink)

      open(chargebeeLink)

      shouldProceed = readlineSync.keyInYN("Rebill the invoice?")
    } else {
      if (lastInvoiceWasPurePlanChargeWithNoBilledCharges) {
        console.log(
          "Last invoice was a plan charge with no unbilled charges. Rebilling."
        )
      } else if (rentalInvoiceBilledAfterLatestInvoiceWithNoBilledCharges) {
        console.log(
          "Rental invoice billed after latest invoice with no unbilled charges. Rebilling"
        )
      }
    }

    if (shouldProceed) {
      await ps.client.rentalInvoice.update({
        where: { id: ri.id },
        data: { status: "ChargeFailed" },
      })
      const riWithData = await ps.client.rentalInvoice.findUnique({
        where: { id: ri.id },
        select: ProcessableRentalInvoiceArgs.select,
      })
      await rental.processInvoice(riWithData, {
        onError: err => {
          console.log(err)
        },
      })
    } else {
      console.log(`DID NOT RECONCILE INVOICE WITH ID: ${ri.id}`)
    }
  }

  console.log("Done")
}

run()

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

const getChargebeeCustomersForCustomerIds = async ids => {
  let offset = "start"
  const allRecords = []
  while (true) {
    let list
    const listParams = {}
    listParams["id[in]"] = `[${ids}]`
    ;({ next_offset: offset, list } = await chargebee.customer
      .list({
        ...listParams,
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allRecords.push(...list?.map(a => a["customer"]))
    if (!offset) {
      break
    }
  }
  return allRecords
}
