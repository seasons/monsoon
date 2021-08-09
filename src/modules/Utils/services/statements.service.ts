import { Injectable } from "@nestjs/common"
import { Customer, Reservation } from "@prisma/client"

@Injectable()
export class StatementsService {
  constructor() {}

  reservationIsActive(reservation: Pick<Reservation | Reservation, "status">) {
    return (
      !!reservation &&
      !["Completed", "Cancelled", "Lost"].includes(reservation.status)
    )
  }

  isPayingCustomer(customer: Pick<Customer, "status">) {
    return !!customer && ["Active", "Paused"].includes(customer.status)
  }

  onProductionEnvironment() {
    return process.env.NODE_ENV === "production"
  }
}
