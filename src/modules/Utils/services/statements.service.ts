import { Reservation as PrismaOneReservation } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { Customer, Reservation } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

@Injectable()
export class StatementsService {
  constructor(private readonly prisma: PrismaService) {}

  reservationIsActive(
    reservation: Pick<Reservation | PrismaOneReservation, "status">
  ) {
    return (
      !!reservation && !["Completed", "Cancelled"].includes(reservation.status)
    )
  }

  isPayingCustomer(customer: Pick<Customer, "status">) {
    return !!customer && ["Active", "Paused"].includes(customer.status)
  }

  onProductionEnvironment() {
    return process.env.NODE_ENV === "production"
  }
}
