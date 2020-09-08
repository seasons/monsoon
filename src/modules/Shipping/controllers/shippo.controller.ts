import { PushNotificationID } from "@app/modules/PushNotification/pushNotification.types"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotification: PushNotificationService
  ) {}

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
              status
              sentPackage {
                transactionID
              }
              returnedPackage {
                transactionID
              }
          }`
          )
        )

        if (reservation.status === "Completed") {
          break
        }

        const phase = this.reservationPhase(reservation, transactionID)

        const reservationStatus = this.convertShippoToReservationStatus(
          status,
          subStatus,
          phase
        )

        try {
          await this.updateLastLocation(reservationStatus, reservation, phase)
          await this.sendPushNotificationForReservationStatus(
            reservationStatus,
            reservation
          )
        } catch (e) {
          this.logger.error("Error while updating last location")
          this.logger.error(e)
        }

        await this.prisma.client.updateReservation({
          where: { id: reservation.id },
          data: {
            status: reservationStatus,
            phase,
            ...(reservationStatus === "Delivered"
              ? { receivedAt: new Date() }
              : {}),
            ...(reservationStatus === "Shipped"
              ? { shippedAt: new Date(), shipped: true }
              : {}),
          },
        })

        const updatedPackage = head(
          await this.prisma.client.packages({
            where: {
              transactionID,
            },
          })
        )

        if (updatedPackage) {
          await this.prisma.client.updatePackage({
            where: {
              id: updatedPackage.id,
            },
            data: {
              events: {
                connect: {
                  id: packageTransitEvent.id,
                },
              },
            },
          })
        }

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

  async updateLastLocation(
    reservationStatus: ReservationStatus,
    reservation: ReservationWithPackage,
    phase: ReservationPhase
  ) {
    if (reservationStatus === "Delivered") {
      const reservationWithData = await this.prisma.binding.query.reservation(
        { where: { id: reservation.id } },
        `
        {
          id
          customer {
            id
          }
          products {
            id
          }
        }
      `
      )

      let location
      if (phase === "BusinessToCustomer") {
        const customerWithShippingAddress = await this.prisma.binding.query.customer(
          { where: { id: reservationWithData.customer.id } },
          `
          {
            id
            detail {
              id
              shippingAddress {
                id
              }
            }
          }
        `
        )
        location = customerWithShippingAddress.detail.shippingAddress
      } else if (phase === "CustomerToBusiness") {
        location = await this.prisma.client.location({
          slug:
            process.env.SEASONS_CLEANER_LOCATION_SLUG ||
            "seasons-cleaners-official",
        })
      }

      reservationWithData.products?.forEach(async product => {
        await this.prisma.client.updatePhysicalProduct({
          where: { id: product.id },
          data: {
            location: {
              connect: {
                id: location.id,
              },
            },
          },
        })
      })

      await this.prisma.client.updateReservation({
        where: { id: reservation.id },
        data: {
          phase,
          lastLocation: {
            connect: {
              id: location.id,
            },
          },
        },
      })
    }
  }

  async sendPushNotificationForReservationStatus(
    status: ReservationStatus,
    reservation: Reservation
  ) {
    const user = await this.prisma.client
      .reservation({ id: reservation.id })
      .user()

    const pushNotifID = `Reservation${status}` as PushNotificationID

    if (["Shipped", "Delivered"].includes(status)) {
      const receipt = head(
        await this.prisma.client.pushNotificationReceipts({
          where: {
            users_every: { id: user.id },
            recordID: reservation.id,
            notificationKey: pushNotifID,
          },
        })
      )

      if (!receipt) {
        await this.pushNotification.pushNotifyUser({
          email: user.email,
          pushNotifID,
          vars: {
            id: reservation.id,
          },
        })
      }
    }
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
