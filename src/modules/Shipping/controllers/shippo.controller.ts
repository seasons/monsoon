import {
  Package,
  PackageTransitEventStatus,
  Reservation,
  ReservationPhase,
  ReservationStatus,
} from "@app/prisma"
import { PackageTransitEventSubStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import casify from "camelcase-keys"
import { camelCase, head, isObject, upperFirst } from "lodash"

export enum ShippoEventType {
  TransactionCreated = "transaction_created",
  TrackUpdated = "track_updated",
}

export type ShippoData = {
  carrier: "ups"
  event: ShippoEventType
  data: {
    trackingNumber: string
    trackingStatus: {
      objectId: string
      statusDate: string
      statusDetails: string
      status: PackageTransitEventStatus
      substatus: {
        code: PackageTransitEventSubStatus
      }
      location: {
        city: string
        country: string
        state: string
        zip: string
      }
    }
    transaction?: string
  }
  test?: boolean
}

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
  private readonly logger = new Logger(ShippoController.name)

  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async handlePost(@Body() body: ShippoData) {
    const result = casify(body, { deep: true })
    const { data, event } = result
    const { trackingStatus, transaction: transactionID } = data

    this.logger.log("Received shippo event:")
    this.logger.log(result)

    const status = upperFirst(
      camelCase(trackingStatus.status)
    ) as PackageTransitEventStatus

    const subStatus = (isObject(trackingStatus.substatus)
      ? upperFirst(camelCase(trackingStatus?.substatus?.code))
      : "Other") as PackageTransitEventSubStatus

    const packageTransitEvent = await this.prisma.client.createPackageTransitEvent(
      {
        status,
        subStatus,
        data: result,
      }
    )

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

        await this.prisma.client.updateReservation({
          where: { id: reservation.id },
          data: {
            status: reservationStatus,
            phase,
          },
        })

        break
    }

    return packageTransitEvent
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
