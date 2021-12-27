import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const email = "admin@kendallkellyinc.com"
  const c = await ps.client.customer.findMany({
    where: { user: { email } },
    select: {
      membership: {
        select: {
          rentalInvoices: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              status: true,
              createdAt: true,
              billingEndAt: true,
              billingStartAt: true,
              membershipId: true,
              reservations: { select: { reservationNumber: true } },
              products: {
                select: { id: true, seasonsUID: true, productStatus: true },
              },
              lineItems: {
                select: {
                  daysRented: true,
                  price: true,
                  comment: true,
                  physicalProduct: {
                    select: {
                      productVariant: {
                        select: { product: { select: { name: true } } },
                      },
                    },
                  },
                },
              },
              // reservationPhysicalProducts: {
              //   select: {
              //     hasBeenDeliveredToBusiness: true,
              //     deliveredToBusinessAt: true,
              //     hasBeenDeliveredToCustomer: true,
              //     deliveredToCustomerAt: true,
              //     hasBeenLost: true,
              //     hasBeenScannedOnInbound: true,
              //     scannedOnInboundAt: true,
              //     hasBeenScannedOnOutbound: true,
              //     scannedOnOutboundAt: true,
              //     status: true,
              //     shippingMethod: { select: { code: true } },
              //   },
              // },
            },
          },
        },
      },
    },
  })
  console.dir(c, { depth: null })
}
run()
