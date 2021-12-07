import { ReservationUtilsService } from "@app/modules/Utils/services/reservation.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import {
  Customer,
  Package,
  PackageTransitEventStatus,
  Reservation,
  ReservationPhase,
  ReservationPhysicalProduct,
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

    if (trackingStatus === null || event !== ShippoEventType.TrackUpdated) {
      return null
    }

    const status = upperFirst(
      camelCase(trackingStatus?.status)
    ) as PackageTransitEventStatus

    const subStatus = (isObject(trackingStatus?.substatus)
      ? upperFirst(camelCase(trackingStatus?.substatus?.code))
      : "Other") as PackageTransitEventSubStatus

    let packageTransitEvent: any

    const promises = []

    const newTransitEventID = cuid()
    promises.push(
      this.prisma.client.packageTransitEvent.create({
        data: {
          id: newTransitEventID,
          status,
          subStatus,
          data: payload,
        },
      })
    )

    // Update reservation phase
    const reservationUpdatePromises = await this.updateReservationPhases(
      transactionID
    )
    promises.push(...reservationUpdatePromises)

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
          where: {
            status: {
              in: ["Packed", "InTransitOutbound", "ScannedOnOutbound"],
            },
          },
          select: {
            id: true,
            scannedOnOutboundAt: true,
            status: true,
            hasBeenScannedOnOutbound: true,
            hasBeenDeliveredToCustomer: true,
            reservation: { select: { id: true } },
          },
        },
        reservationOnReturnPackages: {
          take: 1,
          select: { customer: { select: { id: true } } },
        },
      },
    })

    if (packageToUpdate) {
      const updatePackagePromise = this.updatePackage(
        packageToUpdate,
        status,
        newTransitEventID
      )
      const updateOutboundRPPPromises = await this.updateOutboundRPPs(
        packageToUpdate,
        status,
        subStatus
      )
      const updateInboundRPPPromises = await this.updateInboundRPPs(
        packageToUpdate,
        status,
        subStatus
      )

      promises.push(updatePackagePromise)
      promises.push(...updateOutboundRPPPromises)
      promises.push(...updateInboundRPPPromises)
    }

    const result = await this.prisma.client.$transaction(promises)
    packageTransitEvent = result.shift()

    return packageTransitEvent
  }

  private async updateOutboundRPPs(
    packageToUpdate: {
      reservationPhysicalProductsOnOutboundPackage: Array<
        Pick<
          ReservationPhysicalProduct,
          | "hasBeenDeliveredToCustomer"
          | "hasBeenScannedOnOutbound"
          | "status"
          | "id"
        > & { reservation: Pick<Reservation, "id"> }
      >
    },
    status: PackageTransitEventStatus,
    subStatus: PackageTransitEventSubStatus
  ) {
    const promises = []
    const rppsToUpdate =
      packageToUpdate.reservationPhysicalProductsOnOutboundPackage

    let numRPPsSetToDeliveredToCustomer = 0

    const rppStatusesAfterChange = {}
    for (const rpp of rppsToUpdate) {
      let updateData: Prisma.ReservationPhysicalProductUpdateInput = {}
      if (!rpp.hasBeenScannedOnOutbound) {
        updateData.hasBeenScannedOnOutbound = true
        updateData.scannedOnOutboundAt = new Date()
        if (rpp.status === "Packed") {
          updateData.status = "ScannedOnOutbound"
        }
      }
      if (status === "Delivered" && !rpp.hasBeenDeliveredToCustomer) {
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
      if (updateData["status"]) {
        rppStatusesAfterChange[rpp.id] = updateData["status"]
      }
    }

    if (numRPPsSetToDeliveredToCustomer > 0) {
      const reservationsToUpdate = uniq(rppsToUpdate.map(a => a.reservation.id))
      const reservationStatusUpdatePromises = await this.reservationUtils.updateReservationOnChange(
        reservationsToUpdate,
        rppStatusesAfterChange
      )
      promises.push(...reservationStatusUpdatePromises)
    }

    return promises
  }

  private async updateInboundRPPs(
    packageToUpdate: Pick<Package, "id"> & {
      reservationOnReturnPackages: Array<{ customer: Pick<Customer, "id"> }>
    },
    status: PackageTransitEventStatus,
    subStatus: PackageTransitEventSubStatus
  ) {
    const promises = []
    const customerId =
      packageToUpdate.reservationOnReturnPackages[0]?.customer.id
    if (!customerId) {
      return promises
    }
    const rppsToUpdate = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          customer: { id: customerId },
          status: {
            in: ["ReturnPending", "ScannedOnInbound", "InTransitInbound"],
          },
        },
        select: {
          id: true,
          hasBeenScannedOnInbound: true,
          status: true,
          hasBeenDeliveredToBusiness: true,
        },
      }
    )

    for (const rpp of rppsToUpdate) {
      let updateData: Prisma.ReservationPhysicalProductUpdateInput = {
        inboundPackage: { connect: { id: packageToUpdate.id } },
        physicalProduct: {
          update: { packages: { connect: { id: packageToUpdate.id } } },
        },
      }
      if (!rpp.hasBeenScannedOnInbound) {
        updateData.hasBeenScannedOnInbound = true
        updateData.scannedOnInboundAt = new Date()
        if (rpp.status === "ReturnPending") {
          updateData.status = "ScannedOnInbound"
        }
      }
      if (status === "Delivered" && !rpp.hasBeenDeliveredToBusiness) {
        updateData.status = "DeliveredToBusiness"
        updateData.hasBeenDeliveredToBusiness = true
        updateData.deliveredToBusinessAt = new Date()
      } else if (status === "Transit" && subStatus !== "PackageAccepted") {
        updateData.status = "InTransitInbound"
      }
      promises.push(
        this.prisma.client.reservationPhysicalProduct.update({
          data: updateData,
          where: { id: rpp.id },
        })
      )
    }

    return promises
  }
  private updatePackage(packageToUpdate, status, newTransitEventID) {
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

    return this.prisma.client.package.update({
      where: {
        id: packageToUpdate.id,
      },
      data: updatePackageData,
    })
  }

  private async updateReservationPhases(transactionID) {
    const promises = []
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
      let phase: ReservationPhase =
        r.sentPackage.transactionID === transactionID
          ? "BusinessToCustomer"
          : "CustomerToBusiness"
      if (r.phase !== phase) {
        promises.push(
          this.prisma.client.reservation.update({
            where: { id: r.id },
            data: { phase },
          })
        )
      }
    }

    return promises
  }
}
