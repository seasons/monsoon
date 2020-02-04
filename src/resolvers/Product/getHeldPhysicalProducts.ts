import { ReservationWithProductVariantData } from "./getLatestReservation"
import { PhysicalProduct } from "../../prisma"
import { Context } from "../../utils"
import { getReservedBagItems } from "./utils"

export async function getHeldPhysicalProducts(
  ctx: Context,
  lastReservation: ReservationWithProductVariantData
): Promise<PhysicalProduct[]> {
  if (lastReservation == null) {
    return []
  }

  const reservedBagItems = await getReservedBagItems(ctx)
  const reservedProductVariantIds = reservedBagItems.map(
    a => a.productVariant.id
  )

  return lastReservation.products
    .filter(prod => prod.inventoryStatus === "Reserved")
    .filter(a => reservedProductVariantIds.includes(a.productVariant.id))
}
