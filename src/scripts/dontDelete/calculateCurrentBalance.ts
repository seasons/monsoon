import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { head } from "lodash"

import { AppModule } from "../../app.module"
import { RentalService } from "../../modules/Payment/services/rental.service"
import { ReservationService } from "../../modules/Reservation/services/reservation.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const rental = app.get(RentalService)
  const ps = app.get(PrismaService)

  const customerEmail = "vaughalv13@gmail.com"

  const customerWithEmail = await ps.client.customer.findFirst({
    where: { user: { email: customerEmail } },
  })
  const balance = await rental.calculateCurrentBalance(customerWithEmail.id, {
    upTo: "billingEnd",
  })
  console.log(balance)
}

run()
