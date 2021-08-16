import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { head } from "lodash"

import { AppModule } from "../../app.module"
import { ReservationService } from "../../modules/Reservation/services/reservation.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const app = await NestFactory.createApplicationContext(AppModule)
  const shippingService = app.get(ShippingService)

  let x
  try {
    x = await shippingService.shippoValidateAddress({
      street1: "43 The Intervale",
      city: "Roslyn",
      state: "CA",
      zip: "11576",
    })
  } catch (err) {
    console.log(err)
  }

  console.log(x)
}

run()
