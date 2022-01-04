import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const rentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Billed",
    },
    select: {
      id: true,
      membership: {
        select: {
          customerId: true,
        },
      },
      lineItems: {
        select: {
          id: true,
          type: true,
          physicalProductId: true,
          price: true,
        },
      },
    },
  })

  const promises = []

  for (let rentalInvoice of rentalInvoices) {
    const customerPrices = {}
    const customerId = rentalInvoice.membership.customerId
    const physProdLineItems = rentalInvoice.lineItems.filter(a => {
      return a.type === "PhysicalProduct" && a.physicalProductId
    })

    for (let lineItem of physProdLineItems) {
      const physProdId = lineItem.physicalProductId

      const product = await ps.client.product.findFirst({
        where: {
          variants: {
            some: {
              physicalProducts: {
                some: {
                  id: physProdId,
                },
              },
            },
          },
        },
        select: {
          id: true,
        },
      })

      if (customerPrices[product.id]) {
        customerPrices[product.id] += lineItem.price
      } else {
        customerPrices[product.id] = lineItem.price
      }
    }
    Object.keys(customerPrices).forEach(a => {
      promises.push(
        ps.client.productCustomerPrice.create({
          data: {
            productId: a,
            amountBilled: customerPrices[a],
            customerId: customerId,
          },
        })
      )
    })
  }
  ps.client.$transaction(promises)
}

run()
