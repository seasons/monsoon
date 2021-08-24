import { PushNotificationID } from "@app/modules/PushNotification/pushNotification.types.d"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Get, Logger, Post } from "@nestjs/common"
import {
  PackageTransitEventStatus,
  ReservationPhase,
  ReservationStatus,
} from "@prisma/client"
import { PackageTransitEventSubStatus, Prisma } from "@prisma/client"
import casify from "camelcase-keys"
import cuid from "cuid"
import { camelCase, isObject, upperFirst } from "lodash"

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
    private readonly pushNotification: PushNotificationService,
    private readonly testUtils: TestUtilsService
  ) {}

  @Post()
  async handlePost(@Body() body: ShippoData) {
    const payload = casify(body, { deep: true })
    const { data, event } = payload
    const { trackingStatus, transaction: transactionID } = data

    this.logger.log("Received shippo event:")
    this.logger.log(JSON.stringify(payload))

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

    // If status is "Delivered", update "deliveredAt"
    // If status is "PreTransit" or "Transit", set enteredDeliverySystemAt
    // If reservation is lost and on its way to customer, mark package as lost
    // If reservation is lost and on its way back to us, mark relevant package as lost
    switch (event) {
      case ShippoEventType.TrackUpdated:
        const reservation = await this.prisma.client.reservation.findFirst({
          where: {
            OR: [
              { sentPackage: { transactionID } },
              { returnPackages: { some: { transactionID } } },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            receivedAt: true,
            shippedAt: true,
            sentPackage: true,
          },
        })

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

        const packageToUpdate = await this.prisma.client.package.findFirst({
          where: {
            transactionID,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            enteredDeliverySystemAt: true,
            deliveredAt: true,
          },
        })

        const newTransitEventID = cuid()
        const promises = []
        promises.push(
          this.prisma.client.packageTransitEvent.create({
            data: {
              id: newTransitEventID,
              status,
              subStatus,
              data: payload,
              package: { connect: { id: packageToUpdate.id } },
            },
          })
        )

        if (packageToUpdate) {
          const updatePackageData = Prisma.validator<
            Prisma.PackageUpdateInput
          >()({
            events: {
              connect: {
                id: newTransitEventID,
              },
            },
            ...(status === "Delivered" && !packageToUpdate.deliveredAt
              ? { deliveredAt: new Date() }
              : {}),
            ...(["Transit", "PreTransit", "Delivered"].includes(status) &&
            !packageToUpdate.enteredDeliverySystemAt
              ? { enteredDeliverySystemAt: new Date() }
              : {}),
          })
          promises.push(
            this.prisma.client.package.update({
              where: {
                id: packageToUpdate.id,
              },
              data: updatePackageData,
            })
          )
        }

        const reservationUpdateData = Prisma.validator<
          Prisma.ReservationUpdateInput
        >()({
          packageEvents: {
            connect: {
              id: newTransitEventID,
            },
          },
          phase,
          ...(!["Cancelled", "Completed"].includes(reservation.status)
            ? { status: reservationStatus, statusUpdatedAt: new Date() }
            : {}),
          ...(reservationStatus === "Delivered" &&
          reservation.receivedAt === null
            ? { receivedAt: new Date() }
            : {}),
          ...(reservationStatus === "Shipped"
            ? { shippedAt: new Date(), shipped: true }
            : {}),
        })
        promises.push(
          this.prisma.client.reservation.update({
            where: { id: reservation.id },
            data: reservationUpdateData,
          })
        )

        const result = await this.prisma.client.$transaction(promises)
        packageTransitEvent = result.shift()
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
      const reservationWithData = await this.prisma.client.reservation.findFirst(
        {
          where: { id: reservation.id },
          select: {
            id: true,
            customer: true,
            products: true,
          },
        }
      )

      let location
      if (phase === "BusinessToCustomer") {
        const customerWithShippingAddress = await this.prisma.client.customer.findUnique(
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
        location = await this.prisma.client.location.findFirst({
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
          this.prisma.client.physicalProduct.update({
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
        this.prisma.client.reservation.update({
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

      await this.prisma.client.$transaction(promises)
    }
  }

  async sendPushNotificationForReservationStatus(
    status: ReservationStatus,
    reservation
  ) {
    if (["Cancelled", "Completed"].includes(reservation.status)) {
      return
    }
    const user = (
      await this.prisma.client.reservation.findUnique({
        where: { id: reservation.id },
        select: {
          id: true,
          user: true,
        },
      })
    ).user

    const pushNotifID = `Reservation${status}` as PushNotificationID

    if (["Shipped", "Delivered"].includes(status)) {
      const receipt = await this.prisma.client.pushNotificationReceipt.findFirst(
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
