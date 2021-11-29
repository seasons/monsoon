import { ReservationUtilsService } from "@app/modules/Utils/services/reservation.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import {
  PackageTransitEventStatus,
  ReservationPhase,
  ReservationPhysicalProductStatus,
} from "@prisma/client"
import { PackageTransitEventSubStatus, Prisma } from "@prisma/client"
import casify from "camelcase-keys"
import cuid from "cuid"
import { camelCase, isObject, uniq, upperFirst } from "lodash"

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
    private readonly reservationUtils: ReservationUtilsService
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

    // Return early if its not a transit event
    if (event !== ShippoEventType.TrackUpdated) {
      return
    }

    const promises = []

    // Update reservation phase
    const reservationsToUpdate = await this.prisma.client.reservation.findMany({
      where: {
        OR: [
          { sentPackage: { transactionID } },
          { returnPackages: { some: { transactionID } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        phase: true,
        sentPackage: { select: { transactionID: true } },
      },
    })
    for (const r of reservationsToUpdate) {
      const phase = this.reservationPhase(r, transactionID)
      if (r.phase !== phase) {
        promises.push(
          this.prisma.client.reservation.update({
            where: { id: r.id },
            data: { phase },
          })
        )
      }
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
        reservationPhysicalProductsOnOutboundPackage: {
          select: {
            id: true,
            scannedOnOutboundAt: true,
            status: true,
            hasBeenScannedOnOutbound: true,
            hasBeenDeliveredToCustomer: true,
            reservation: { select: { id: true } },
          },
        },
        reservationPhysicalProductsOnInboundPackage: { select: { id: true } },
      },
    })

    const outboundRPPsToUpdate =
      packageToUpdate.reservationPhysicalProductsOnOutboundPackage

    const newTransitEventID = cuid()
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
      const updatePackageData = Prisma.validator<Prisma.PackageUpdateInput>()({
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

      if (outboundRPPsToUpdate) {
        let numRPPsSetToDeliveredToCustomer = 0
        const validPreDeliveryStatuses = [
          "ScannedOnOutbound",
          "InTransitOutbound",
          "Packed",
        ] as ReservationPhysicalProductStatus[]
        for (const rpp of outboundRPPsToUpdate) {
          let updateData: Prisma.ReservationPhysicalProductUpdateInput = {}
          if (!rpp.hasBeenScannedOnOutbound) {
            updateData.hasBeenScannedOnOutbound = true
            updateData.scannedOnOutboundAt = new Date()
            if (rpp.status === "Packed") {
              updateData.status = "ScannedOnOutbound"
            }
          }
          if (
            status === "Delivered" &&
            validPreDeliveryStatuses.includes(rpp.status) &&
            !rpp.hasBeenDeliveredToCustomer
          ) {
            updateData.status = "DeliveredToCustomer"
            updateData.hasBeenDeliveredToCustomer = true
            updateData.deliveredToCustomerAt = new Date()
            numRPPsSetToDeliveredToCustomer++
          } else if (status === "Transit" && subStatus !== "PackageAccepted") {
            updateData.status = "InTransitOutbound"
          }
          promises.push(
            this.prisma.client.reservationPhysicalProduct.update({
              data: updateData,
              where: { id: rpp.id },
            })
          )
        }

        const reservationsToUpdate = uniq(
          outboundRPPsToUpdate.map(a => a.reservation.id)
        )
        if (numRPPsSetToDeliveredToCustomer > 0) {
          const reservationStatusUpdatePromises = await this.reservationUtils.updateReservationOnChange(
            reservationsToUpdate,
            { DeliveredToCustomer: numRPPsSetToDeliveredToCustomer },
            outboundRPPsToUpdate.map(a => a.id)
          )
          promises.push(...reservationStatusUpdatePromises)
        }
      }
    }

    const result = await this.prisma.client.$transaction(promises)
    packageTransitEvent = result.shift()

    return packageTransitEvent
  }

  reservationPhase(reservation, transactionID: string): ReservationPhase {
    if (reservation.sentPackage.transactionID === transactionID) {
      return "BusinessToCustomer"
    }
    return "CustomerToBusiness"
  }
}
