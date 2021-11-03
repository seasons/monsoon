import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  // const invoiceId = "cktt8xz7s9298q6uvwyrsnrut"
  // const x = await ps.client.rentalInvoice.findUnique({
  //   where: { id: invoiceId },
  //   select: {
  //     status: true,
  //     lineItems: { select: { price: true, name: true, comment: true } },
  //     membership: { select: { customer: { select: { user: true } } } },
  //   },
  // })
  // console.dir(x, { depth: null })

  const customersWithRentalInvoice = await ps.client.customer.findMany({
    where: {
      membership: {
        rentalInvoices: {
          some: {
            status: "Draft",
          },
        },
      },
      user: {
        NOT: {
          email: {
            contains: "@seasons.nyc",
          },
        },
      },
    },
    select: {
      user: {
        select: {
          email: true,
        },
      },
      membership: {
        select: {
          rentalInvoices: {
            orderBy: {
              billingStartAt: "asc",
            },
            select: {
              billingEndAt: true,
              billingStartAt: true,
            },
          },
        },
      },
    },
  })

  const filteredCustomers = customersWithRentalInvoice.filter(
    x => x.membership?.rentalInvoices.length > 1
  )

  const customers = []
  filteredCustomers.forEach(customer => {
    const rentalInvoices = [...customer.membership.rentalInvoices]

    let previousRentalInvoice = rentalInvoices.shift()

    while (rentalInvoices.length > 0) {
      const currentRentalInvoice = rentalInvoices.shift()
      const previousRentalInvoiceDate = previousRentalInvoice.billingEndAt.getDate()
      const currentRentalInvoiceDate = currentRentalInvoice.billingStartAt.getDate()

      const dateDiff = Math.abs(
        previousRentalInvoiceDate - currentRentalInvoiceDate
      )

      if (dateDiff > 3) {
        console.dir(customer, { depth: null })
        customers.push(customer)
        return
      }
      previousRentalInvoice = currentRentalInvoice
    }
  })
  console.log(customers.length)
}
run()
