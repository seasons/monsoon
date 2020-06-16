import {
  Package,
  PackageTransitEventStatus,
  Reservation,
  ReservationPhase,
  ReservationStatus,
} from "@app/prisma"
import { PackageTransitEventSubStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Post } from "@nestjs/common"
import { camelCase, head, upperCase } from "lodash"

import { ShippoData, ShippoEventType } from "../shipping.types"

type ReservationWithPackage = Reservation & {
  sentPackage: Package
  returnedPackage: Package
}

/**
 *
 * @Example POST http://localhost:4000/shippo_events
 */
@Controller("shippo_events")
export class ShippoController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async handlePost(@Body() result: ShippoData) {
    const { carrier, data, event, transaction: transactionID } = result
    const { tracking_status } = data

    const status = upperCase(
      camelCase(tracking_status.status)
    ) as PackageTransitEventStatus

    const subStatus = upperCase(
      camelCase(tracking_status.substatus)
    ) as PackageTransitEventSubStatus

    await this.prisma.client.createPackageTransitEvent({
      status,
      subStatus,
      data: result,
    })

    switch (event) {
      case ShippoEventType.TrackUpdated:
        const reservation: ReservationWithPackage = head(
          await this.prisma.binding.query.reservations(
            {
              where: {
                OR: [
                  { sentPackage: { transactionID } },
                  { returnedPackage: { transactionID } },
                ],
              },
            },
            `{
              id
              sentPackage {
                transactionID
              }
              returnedPackage {
                transactionID
              }
          }`
          )
        )
        const phase = this.reservationPhase(reservation, transactionID)

        const reservationStatus = this.convertShippoToReservationStatus(
          status,
          subStatus,
          phase
        )
        console.log("Reservation: ", reservation, reservationStatus)

        await this.prisma.client.updateReservation({
          where: { id: reservation.id },
          data: {
            status: reservationStatus,
            phase,
          },
        })

        break
    }
  }

  reservationPhase(
    reservation: ReservationWithPackage,
    transactionID: string
  ): ReservationPhase {
    if (reservation.sentPackage.transactionID === transactionID) {
      return "BusinessToCustomer"
    }
    return "CustomerToBusiness"
  }

  convertShippoToReservationStatus(
    status: PackageTransitEventStatus,
    substatus: PackageTransitEventSubStatus,
    phase: ReservationPhase
  ): ReservationStatus {
    switch (status) {
      case "PreTransit":
        if (phase === "CustomerToBusiness") {
          return "Delivered"
        }
        return "Shipped"
      case "Transit":
        switch (substatus) {
          case "AddressIssue":
          case "ContactCarrier":
          case "LocationInaccessible":
          case "PackageDamaged":
          case "PackageHeld":
          case "RescheduleDelivery":
            return "Blocked"
          default:
            return "Shipped"
        }
      case "Delivered":
        return "Delivered"
      case "Returned":
        return "Blocked"
      case "Failure":
        return "Blocked"
    }
    return "Unknown"
  }
}
