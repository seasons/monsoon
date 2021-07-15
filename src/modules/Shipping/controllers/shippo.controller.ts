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

    if (trackingStatus === null) {
      return null
    }

    const status = upperFirst(
      camelCase(trackingStatus?.status)
    ) as PackageTransitEventStatus

    const subStatus = (isObject(trackingStatus?.substatus)
      ? upperFirst(camelCase(trackingStatus?.substatus?.code))
      : "Other") as PackageTransitEventSubStatus

    let packageTransitEvent: any

    switch (event) {
      case ShippoEventType.TrackUpdated:
        const reservation = await this.prisma.client2.reservation.findFirst({
          where: {
            OR: [
              { sentPackage: { transactionID } },
              { returnedPackage: { transactionID } },
            ],
          },
          select: {
            id: true,
            status: true,
            receivedAt: true,
            shippedAt: true,
            sentPackage: true,
            returnedPackage: true,
          },
        })

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

        const updatedPackage = await this.prisma.client2.package.findFirst({
          where: {
            transactionID,
          },
        })

        packageTransitEvent = await this.prisma.client2.packageTransitEvent.create(
          {
            data: {
              status,
              subStatus,
              data: JSON.stringify(result),
              package: { connect: { id: updatedPackage.id } },
            },
          }
        )

        if (updatedPackage) {
          await this.prisma.client2.package.update({
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

        await this.prisma.client2.reservation.update({
          where: { id: reservation.id },
          data: {
            status: reservationStatus,
            packageEvents: {
              connect: {
                id: packageTransitEvent.id,
              },
            },
            phase,
            ...(reservationStatus === "Delivered" &&
            reservation.receivedAt === null
              ? { receivedAt: new Date() }
              : {}),
            ...(reservationStatus === "Shipped"
              ? { shippedAt: new Date(), shipped: true }
              : {}),
            statusUpdatedAt: new Date(),
          },
        })

        break
    }

    return packageTransitEvent
  }

  reservationPhase(reservation, transactionID: string): ReservationPhase {
    if (reservation.sentPackage.transactionID === transactionID) {
      return "BusinessToCustomer"
    }
    return "CustomerToBusiness"
  }

  async updateLastLocation(
    reservationStatus: ReservationStatus,
    reservation,
    phase: ReservationPhase
  ) {
    if (reservationStatus === "Delivered") {
      const _reservationWithData = await this.prisma.client2.reservation.findFirst(
        {
          where: { id: reservation.id },
          select: {
            id: true,
            customer: true,
            products: true,
          },
        }
      )
      const reservationWithData = this.prisma.sanitizePayload(
        _reservationWithData,
        "Reservation"
      )

      let location
      if (phase === "BusinessToCustomer") {
        const customerWithShippingAddress = await this.prisma.client2.customer.findUnique(
          {
            where: { id: reservationWithData.customer.id },
            select: {
              id: true,
              detail: {
                select: {
                  id: true,
                  shippingAddress: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          }
        )

        location = customerWithShippingAddress.detail.shippingAddress
      } else if (phase === "CustomerToBusiness") {
        location = await this.prisma.client2.location.findFirst({
          where: {
            slug:
              process.env.SEASONS_CLEANER_LOCATION_SLUG ||
              "seasons-cleaners-official",
          },
        })
      }

      const promises = []

      reservationWithData.products?.forEach(async product => {
        promises.push(
          this.prisma.client2.physicalProduct.update({
            where: { id: product.id },
            data: {
              location: {
                connect: {
                  id: location.id,
                },
              },
            },
          })
        )
      })

      promises.push(
        this.prisma.client2.reservation.update({
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
      )

      await this.prisma.client2.$transaction(promises)
    }
  }

  async sendPushNotificationForReservationStatus(
    status: ReservationStatus,
    reservation
  ) {
    const user = (
      await this.prisma.client2.reservation.findUnique({
        where: { id: reservation.id },
        select: {
          id: true,
          user: true,
        },
      })
    ).user

    const pushNotifID = `Reservation${status}` as PushNotificationID

    if (["Shipped", "Delivered"].includes(status)) {
      const receipt = await this.prisma.client2.pushNotificationReceipt.findFirst(
        {
          where: {
            users: { every: { id: user.id } },
            recordID: reservation.id,
            notificationKey: pushNotifID,
          },
        }
      )

      if (!receipt) {
        await this.pushNotification.pushNotifyUsers({
          emails: [user.email],
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
