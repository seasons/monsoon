import "module-alias/register"

import { head } from "lodash"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "../../app.module"

import { PrismaService } from "../../prisma/prisma.service"
import { ReservationService } from "../../modules/Reservation/services/reservation.service"

const run = async () => {
  const ps = new PrismaService()
  const app = await NestFactory.createApplicationContext(AppModule)
  const reservationService = app.get(ReservationService)

  const userID = "ck2gf2rh706dx0757geroxv6i"

  const prismaUser = await ps.client.user.findUnique({
    where: { id: userID },
    select: {
      id: true,
    },
  })
  const reservations = await ps.client.reservation.findMany({
    where: {
      user: {
        id: userID,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      products: {
        select: {
          id: true,
          productVariant: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  const _reservation = head(reservations)
  const productVariantIDs = _reservation.products.map(p => p.productVariant.id)

  const returnedPhysicalProducts = await ps.client.productVariant.findMany({
    where: {
      id: {
        in: productVariantIDs,
      },
    },
    select: {
      id: true,
    },
  })

  const [reservationFeedbackPromise] =
    await reservationService.createReservationFeedbacksForVariants(
      returnedPhysicalProducts,
      prismaUser,
      _reservation
    )

  await ps.client.$transaction([reservationFeedbackPromise])
  console.log("finished")
}

run()
