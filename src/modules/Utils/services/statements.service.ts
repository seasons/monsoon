import { Reservation } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class StatementsService {
  constructor(private readonly prisma: PrismaService) {}

  reservationIsActive(reservation: Pick<Reservation, "status">) {
    return (
      !!reservation && !["Completed", "Cancelled"].includes(reservation.status)
    )
  }
}
