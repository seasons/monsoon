import { Context } from "../../utils"
import {
  ID_Input,
  PhysicalProduct,
  ProductVariant,
  ReservationStatus,
  Prisma,
  ReservationCreateInput,
  Reservation,
} from "../../prisma"
import { uniqBy } from "lodash"
import { ReservationWithProductVariantData } from "./getLatestReservation"
import { ApolloError } from "apollo-server"
import { getCustomerFromContext } from "../../auth/utils"

export async function getPhysicalProductsWithReservationSpecificData(
  ctx: Context,
  items: ID_Input[]
): Promise<Array<PhysicalProductWithReservationSpecificData>> {
  return await ctx.db.query.physicalProducts(
    {
      where: {
        productVariant: {
          id_in: items,
        },
      },
    },
    `{ 
          id
          seasonsUID
          inventoryStatus 
          productVariant { 
              id 
          } 
      }`
  )
}

export function extractUniqueReservablePhysicalProducts(
  physicalProducts: PhysicalProductWithReservationSpecificData[]
): PhysicalProductWithReservationSpecificData[] {
  return uniqBy(
    physicalProducts.filter(a => a.inventoryStatus === "Reservable"),
    b => b.productVariant.id
  )
}

export function checkLastReservation(
  lastReservation: ReservationWithProductVariantData
) {
  if (
    !!lastReservation &&
    ![
      "Completed" as ReservationStatus,
      "Cancelled" as ReservationStatus,
    ].includes(lastReservation.status)
  ) {
    throw new ApolloError(
      `Last reservation has non-completed, non-cancelled status. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`
    )
  }
}

/* Returns [createdReservation, rollbackFunc] */
export async function createPrismaReservation(
  prisma: Prisma,
  reservationData: ReservationCreateInput
): Promise<[Reservation, Function]> {
  const reservation = await prisma.createReservation(reservationData)
  const rollbackPrismaReservation = async () => {
    await prisma.deleteReservation({ id: reservation.id })
  }
  return [reservation, rollbackPrismaReservation]
}

export async function getReservedBagItems(ctx) {
  const customer = await getCustomerFromContext(ctx)
  const reservedBagItems = await ctx.db.query.bagItems(
    {
      where: {
        customer: {
          id: customer.id,
        },
        status: "Reserved",
      },
    },
    `{
        id
        status
        position
        saved
        productVariant {
          id
        }
    }`
  )
  return reservedBagItems
}

export interface PhysicalProductWithReservationSpecificData
  extends PhysicalProduct {
  productVariant: Pick<ProductVariant, "id">
}
