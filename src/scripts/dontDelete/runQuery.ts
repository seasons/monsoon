import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const tu = new TimeUtilsService()

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

  // const customersWithRentalInvoice = await ps.client.customer.findMany({
  //   where: {
  //     status: "Active",
  //     membership: {
  //       rentalInvoices: {
  //         some: {
  //           status: "Draft",
  //         },
  //       },
  //     },
  //     user: {
  //       NOT: {
  //         email: {
  //           contains: "@seasons.nyc",
  //         },
  //       },
  //     },
  //   },
  //   select: {
  //     user: {
  //       select: {
  //         email: true,
  //       },
  //     },
  //     membership: {
  //       select: {
  //         rentalInvoices: {
  //           orderBy: {
  //             billingStartAt: "asc",
  //           },
  //           select: {
  //             billingEndAt: true,
  //             billingStartAt: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // })

  // const filteredCustomers = customersWithRentalInvoice.filter(
  //   x => x.membership?.rentalInvoices.length > 1
  // )

  // const customers = []
  // filteredCustomers.forEach(customer => {
  //   const rentalInvoices = [...customer.membership.rentalInvoices]

  //   let previousRentalInvoice = rentalInvoices.shift()

  //   while (rentalInvoices.length > 0) {
  //     const currentRentalInvoice = rentalInvoices.shift()
  //     const previousRentalInvoiceDate = previousRentalInvoice.billingEndAt.getDate()
  //     const currentRentalInvoiceDate = currentRentalInvoice.billingStartAt.getDate()

  //     const dateDiff = Math.abs(
  //       previousRentalInvoiceDate - currentRentalInvoiceDate
  //     )

  //     if (dateDiff > 3) {
  //       console.dir(customer, { depth: null })
  //       customers.push(customer)
  //       return
  //     }
  //     previousRentalInvoice = currentRentalInvoice
  //   }
  // })
  // console.log(customers.length)

  // const ameeshReturnPackage = await ps.client.reservation.findMany({
  //   where: {
  //     customerId: "ckrv2zhly1566431jx96brv3dm0",
  //   },
  //   select: {
  //     reservationNumber: true,
  //     returnedProducts: true,
  //     returnedAt: true,
  //     returnPackages: {
  //       select: {
  //         deliveredAt: true,
  //         enteredDeliverySystemAt: true,
  //       },
  //     },
  //   },
  // })
  // console.dir(ameeshReturnPackage, { depth: null })

  const rentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Draft",
      membership: {
        NOT: {
          plan: {
            planID: "access-yearly",
          },
          subscription: {
            status: { in: ["non_renewing", "cancelled"] },
          },
        },
        grandfathered: true,
        customer: {
          status: "Active",
        },
      },
    },
    select: {
      billingEndAt: true,
      membership: {
        select: {
          customer: {
            select: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                },
              },
            },
          },
          subscription: {
            select: {
              nextBillingAt: true,
            },
          },
        },
      },
    },
  })

  rentalInvoices.forEach(async rentalInvoice => {
    const firstName = rentalInvoice.membership.customer.user.firstName
    const email = rentalInvoice.membership.customer.user.email

    if (
      !rentalInvoice.billingEndAt ||
      !rentalInvoice.membership.subscription.nextBillingAt
    ) {
      return
    }
    const daysBetween = tu.numDaysBetween(
      rentalInvoice.billingEndAt,
      rentalInvoice.membership.subscription.nextBillingAt
    )
    const billingEndAtBeforeNextBillingAt = tu.isLaterDate(
      rentalInvoice.membership.subscription.nextBillingAt,
      rentalInvoice.billingEndAt
    )
    if (daysBetween > 1 && billingEndAtBeforeNextBillingAt) {
      const oneDayAfterNextBillingAt = tu.xDaysAfterDate(
        rentalInvoice.membership.subscription.nextBillingAt,
        1
      )
      console.dir(
        {
          ...rentalInvoice,
          daysBetween: daysBetween,
          oneDayAfterNextBillingAt,
        },
        { depth: null }
      )
    }
  })
}
run()
