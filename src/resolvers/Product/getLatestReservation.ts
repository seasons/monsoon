import {
  Prisma,
  Customer,
  PhysicalProduct,
  ID_Input,
  ReservationStatus,
} from "../../prisma"
import { head } from "lodash"

export async function getLatestReservation(
  prisma: Prisma,
  db: any,
  customer: Customer
): Promise<ReservationWithProductVariantData | null> {
  return new Promise(async function(resolve, reject) {
    const allCustomerReservationsOrderedByCreatedAt = await prisma
      .customer({ id: customer.id })
      .reservations({
        orderBy: "createdAt_DESC",
      })

    const latestReservation = head(allCustomerReservationsOrderedByCreatedAt)
    if (latestReservation == null) {
      resolve(null)
    } else {
      const res = await db.query.reservation(
        {
          where: { id: latestReservation.id },
        },
        `{ 
              id  
              products {
                  id
                  seasonsUID
                  inventoryStatus
                  productStatus
                  productVariant {
                      id
                  }
              }
              status
              reservationNumber
           }`
      )
      resolve(res)
    }
  })
}

interface PhysicalProductWithProductVariant extends PhysicalProduct {
  productVariant: { id: ID_Input }
}
export interface ReservationWithProductVariantData {
  id: ID_Input
  status: ReservationStatus
  reservationNumber: number
  products: PhysicalProductWithProductVariant[]
}
