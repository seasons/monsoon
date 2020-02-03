import { ReservationWithProductVariantData } from "./getLatestReservation"
import { ID_Input, InventoryStatus } from "../../prisma"

export async function getNewProductVariantsBeingReserved(
  lastReservation: ReservationWithProductVariantData,
  items: ID_Input[]
): Promise<ID_Input[]> {
  return new Promise(async function(resolve, reject) {
    if (lastReservation == null) {
      resolve(items)
      return
    }
    const productVariantsInLastReservation = lastReservation.products.map(
      prod => prod.productVariant.id
    )
    const newProductVariantBeingReserved = items.filter(prodVarId => {
      const notInLastReservation = !productVariantsInLastReservation.includes(
        prodVarId as string
      )
      const inLastReservationButNowReservable =
        productVariantsInLastReservation.includes(prodVarId as string) &&
        inventoryStatusOf(lastReservation, prodVarId) === "Reservable"

      return notInLastReservation || inLastReservationButNowReservable
    })

    resolve(newProductVariantBeingReserved)
  })
}

function inventoryStatusOf(
  res: ReservationWithProductVariantData,
  prodVarId: ID_Input
): InventoryStatus {
  return res.products.find(prod => prod.productVariant.id === prodVarId)
    .inventoryStatus
}
