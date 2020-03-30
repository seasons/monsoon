import { Injectable } from "@nestjs/common"

@Injectable()
export class ReservationUtilsService {
  formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
    const date = this.returnDate(reservationCreatedAtDate)
    const display = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
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
