import { ChargeBee, _invoice } from "chargebee-typescript"
import { head } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

// 1. Get invoices from Chargebee
const chargebee = new ChargeBee()
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handleChargebeeResult = (error: Error, result: any) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  return result
}

// Since we need to paginate to get all invoices, this is a recursive function
const invoices = []
const fetchAllPaidInvoices = async (offset: string) => {
  const result = await chargebee.invoice
    .list({
      limit: 100,

      offset,
      status: { in: ["paid"] },
      "sort_by[asc]": "date",
    })
    .request(handleChargebeeResult)

  for (let i = 0; i < result?.list?.length; i++) {
    const entry = result?.list[i]

    const invoice: any = entry?.invoice
    invoices.push(invoice)
  }

  if (result.next_offset && result.next_offset !== "") {
    await fetchAllPaidInvoices(result.next_offset)
  }

  const customerIdToInvoices = {}

  for (let invoice of invoices) {
    const customerId = invoice.customer_id

    if (customerId) {
      customerIdToInvoices[customerId] = customerIdToInvoices[customerId] || []
      customerIdToInvoices[customerId].push(invoice)
    }
  }

  return customerIdToInvoices
}

const getReservationHistory = async () => {
  // const customerIdToInvoices = await fetchAllPaidInvoices("")

  const reservations = await ps.client.reservation.findMany({
    select: {
      id: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
        },
      },
      products: {
        select: {
          id: true,
          productVariant: {
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  wholesalePrice: true,
                },
              },
            },
          },
        },
      },
      rentalInvoice: {
        where: {
          status: "Billed",
        },
        select: {
          id: true,
          billingStartAt: true,
          billingEndAt: true,
          status: true,
          lineItems: {
            select: {
              id: true,
              physicalProductId: true,
              price: true,
            },
          },
        },
      },
    },
  })

  const productsToAmountAccrued = {}

  for (let reservation of reservations) {
    // const invoicesForCustomer = customerIdToInvoices[reservation.customer.id]

    for (let product of reservation.products) {
      const amountAccrued = productsToAmountAccrued[product.id] || 0

      // Depending on the plan, update the amount accrued
      let chargeForReservation = 3000

      if (reservation.rentalInvoice) {
        const invoice = head(reservation.rentalInvoice)
        if (invoice) {
          const lineItem = invoice.lineItems.find(
            lineItem => lineItem.physicalProductId === product.id
          )

          if (lineItem) {
            chargeForReservation = lineItem.price
          }
        }
      }

      productsToAmountAccrued[product.id] = amountAccrued + chargeForReservation
    }
  }

  const physicalProducts = await ps.client.physicalProduct.findMany({
    where: {
      id: {
        in: Object.keys(productsToAmountAccrued),
      },
    },
    select: {
      id: true,
      seasonsUID: true,
      unitCost: true,
    },
  })

  for (let physicalProduct of physicalProducts) {
    const amountAccrued = productsToAmountAccrued[physicalProduct.id] / 100 || 0
    const recoupmentPercentage = (
      (amountAccrued / physicalProduct.unitCost) *
      100
    ).toFixed(2)

    await ps.client.physicalProduct.update({
      where: {
        id: physicalProduct.id,
      },
      data: {
        amountRecouped: productsToAmountAccrued[physicalProduct.id],
      },
    })

    console.log(`${physicalProduct.seasonsUID}: ${recoupmentPercentage}%`)
  }

  // console.log(productsToAmountAccrued)

  return
}

const getInvoices = async () => {
  await getReservationHistory()
  return
}

getInvoices()
