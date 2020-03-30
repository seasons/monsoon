import {
  Prisma,
  Customer,
  PhysicalProduct,
  ReservationCreateInput,
} from "../../prisma"
import { UserRequestObject } from "../../auth/utils"
import { ApolloError } from "apollo-server"
import { formatReservationReturnDate } from "./formatReservationReturnDate"

export async function createReservationData(
  prisma: Prisma,
  seasonsToCustomerTransaction,
  customerToSeasonsTransaction,
  user: UserRequestObject,
  customer: Customer,
  shipmentWeight: number,
  physicalProductsBeingReserved: PhysicalProduct[],
  heldPhysicalProducts: PhysicalProduct[]
): Promise<ReservationCreateInput> {
  const allPhysicalProductsInReservation = [
    ...physicalProductsBeingReserved,
    ...heldPhysicalProducts,
  ]
  if (allPhysicalProductsInReservation.length > 3) {
    throw new ApolloError("Can not reserve more than 3 items at a time")
  }
  const physicalProductSUIDs = allPhysicalProductsInReservation.map(p => ({
    seasonsUID: p.seasonsUID,
  }))

  const customerShippingAddressRecordID = await prisma
    .customer({ id: customer.id })
    .detail()
    .shippingAddress()
    .id()
  interface UniqueIDObject {
    id: string
  }
  const uniqueReservationNumber = await getUniqueReservationNumber(prisma)

  return {
    products: {
      connect: physicalProductSUIDs,
    },
    customer: {
      connect: {
        id: customer.id,
      },
    },
    user: {
      connect: {
        id: user.id,
      },
    },
    sentPackage: {
      create: {
        weight: shipmentWeight,
        items: {
          // need to include the type on the function passed into map
          // or we get build errors comlaining about the type here
          connect: physicalProductsBeingReserved.map(
            (prod): UniqueIDObject => {
              return { id: prod.id }
            }
          ),
        },
        shippingLabel: {
          create: {
            image: seasonsToCustomerTransaction.label_url || "",
            trackingNumber: seasonsToCustomerTransaction.tracking_number || "",
            trackingURL:
              seasonsToCustomerTransaction.tracking_url_provider || "",
            name: "UPS",
          },
        },
        fromAddress: {
          connect: {
            slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
          },
        },
        toAddress: {
          connect: { id: customerShippingAddressRecordID },
        },
      },
    },
    returnedPackage: {
      create: {
        shippingLabel: {
          create: {
            image: customerToSeasonsTransaction.label_url || "",
            trackingNumber: customerToSeasonsTransaction.tracking_number || "",
            trackingURL:
              customerToSeasonsTransaction.tracking_url_provider || "",
            name: "UPS",
          },
        },
        fromAddress: {
          connect: {
            id: customerShippingAddressRecordID,
          },
        },
        toAddress: {
          connect: {
            slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
          },
        },
      },
    },
    reservationNumber: uniqueReservationNumber,
    location: {
      connect: {
        slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
      },
    },
    shipped: false,
    status: "InQueue",
  }
}

async function getUniqueReservationNumber(prisma: Prisma): Promise<number> {
  let reservationNumber: number
  let foundUnique = false
  while (!foundUnique) {
    reservationNumber = Math.floor(Math.random() * 900000000) + 100000000
    const reservationWithThatNumber = await prisma.reservation({
      reservationNumber,
    })
    foundUnique = !reservationWithThatNumber
  }

  return reservationNumber
}
