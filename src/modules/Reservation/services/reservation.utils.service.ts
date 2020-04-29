import { ID_Input, InventoryStatus } from "@app/prisma"
import { Injectable } from "@nestjs/common"

import { ReservationWithProductVariantData } from "./reservation.service"

@Injectable()
export class ReservationUtilsService {
  inventoryStatusOf = (
    res: ReservationWithProductVariantData,
    prodVarId: ID_Input
  ): InventoryStatus => {
    return res.products.find((prod) => prod.productVariant.id === prodVarId)
      .inventoryStatus
  }

  formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
    const date = this.returnDate(reservationCreatedAtDate)
    const display = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    return display
  }

  returnDate = (reservationCreatedAtDate: Date) => {
    const returnDate = new Date(reservationCreatedAtDate)
    returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
    return returnDate
  }
}
