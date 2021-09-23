import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"
import { Prisma } from ".prisma/client"

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const RENTAL_INVOICE_SELECT = Prisma.validator<Prisma.RentalInvoiceSelect>()({
    id: true,
    billingStartAt: true,
    billingEndAt: true,
    status: true,
  })
  /*
  Customers with more than Draft Rental Invoice

  Rental invoices in status PaymentFailed
  
  Rental invoices with a billingEndAt on/before today that are still in daft
  */

  const customesWithDraftInvoices = await ps.client.customer.findMany({
    where: { membership: { rentalInvoices: { some: { status: "Draft" } } } },
    select: {
      membership: {
        select: {
          rentalInvoices: {
            where: { status: "Draft" },
            select: RENTAL_INVOICE_SELECT,
          },
        },
      },
    },
  })

  const customersWithTwoDraftInvoices = customesWithDraftInvoices.filter(
    a => a.membership.rentalInvoices.length >= 2
  )

  const failedInvoices = await ps.client.rentalInvoice.findMany({
    where: { status: "ChargeFailed" },
    select: RENTAL_INVOICE_SELECT,
  })

  const skippedInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      billingEndAt: { lte: timeUtils.xDaysAgoISOString(1) },
      status: { notIn: ["Billed", "ChargeFailed"] },
    },
    select: RENTAL_INVOICE_SELECT,
  })

  console.log(` --> REPORT <--`)
  console.log("\n")
  console.log(` CUSTOMERS WITH MULTIPLE DRAFT INVOICES`)
  console.log(`Number: ${customersWithTwoDraftInvoices.length}`)
  console.dir(customersWithTwoDraftInvoices, { depth: null })
  console.log("\n")
  console.log(` FAILED INVOICES`)
  console.log(`Number: ${failedInvoices.length}`)
  console.dir(failedInvoices, { depth: null })
  console.log("\n")
  console.log(` SKIPPED INVOICES`)
  console.log(`Number: ${skippedInvoices.length}`)
  console.dir(skippedInvoices, { depth: null })
}
run()
