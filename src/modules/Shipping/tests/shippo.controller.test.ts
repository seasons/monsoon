import { APP_MODULE_DEF } from "@app/app.module"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { Reservation } from "@prisma/client"
import request from "supertest"

import {
  TRANSACTION_ID_ONE,
  TRANSACTION_ID_ONE_EVENTS,
  TRANSACTION_ID_TWO,
  TRANSACTION_ID_TWO_EVENTS,
} from "./shippoEvents.stub"

const PACKAGE_ACCEPTED_TXN_ID_ONE = TRANSACTION_ID_ONE_EVENTS["PackageAccepted"]
const PACKAGE_DEPARTED_TXN_ID_ONE = TRANSACTION_ID_ONE_EVENTS["PackageDeparted"]
const PACKAGE_DELIVERED_TXN_ID_ONE = TRANSACTION_ID_ONE_EVENTS["Delivered"]
// const PACKAGE_ACCEPTED_TXN_ID_TWO = TRANSACTION_ID_TWO_EVENTS["PackageAccepted"]
// const PACKAGE_DELIVERED_TXN_ID_TWO = TRANSACTION_ID_TWO_EVENTS["Delivered"]

describe("Shippo Controller", () => {
  let app: INestApplication
  let prismaService: PrismaService
  let testUtils: TestUtilsService
  let reservationTestUtils: ReservationTestUtilsService

  let cleanupFuncs = []

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(APP_MODULE_DEF).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    prismaService = moduleRef.get<PrismaService>(PrismaService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
  })

  afterAll(async () => {
    await Promise.all(cleanupFuncs.map(a => a()))
    app.close()
  })

  describe("Outbound Package", () => {
    let resPhysProdIds
    let outboundPackage
    let reservation

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer()

      ;({
        reservation,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer,
        numProductsToAdd: 3,
      }))

      // Mock Packed state
      await prismaService.client.reservationPhysicalProduct.updateMany({
        where: {
          id: { in: reservation.reservationPhysicalProducts.map(a => a.id) },
        },
        data: { status: "Packed", packedAt: new Date() },
      })
      console.log(TRANSACTION_ID_ONE)
      console.dir(
        {
          data: {
            transactionID: TRANSACTION_ID_ONE,
            items: {
              connect: reservation.reservationPhysicalProducts.map(a => ({
                id: a.id,
              })),
            },
            reservationOnSentPackage: { connect: { id: reservation.id } },
          },
        },
        { depth: null }
      )
      outboundPackage = await prismaService.client.package.create({
        data: {
          transactionID: TRANSACTION_ID_ONE,
          items: {
            connect: reservation.reservationPhysicalProducts.map(a => ({
              id: a.physicalProduct.id,
            })),
          },
          reservationPhysicalProductsOnOutboundPackage: {
            connect: reservation.reservationPhysicalProducts.map(b => ({
              id: b.id,
            })),
          },
          reservationOnSentPackage: { connect: { id: reservation.id } },
        },
      })

      resPhysProdIds = reservation.reservationPhysicalProducts.map(a => a.id)
    })

    it("Updates statuses, booleans and timestamps properly if all events are sent in order", async () => {
      // Send package accepted event. Expect status update, boolean, timestamp
      const packageAcceptedResponse = await request(app.getHttpServer())
        .post("/shippo_events")
        .send(PACKAGE_ACCEPTED_TXN_ID_ONE)
      expect(packageAcceptedResponse.status).toBe(201)

      const resPhysProdsAfterPackageAccepted = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: { id: { in: resPhysProdIds } },
          select: {
            status: true,
            scannedOnOutboundAt: true,
            hasBeenScannedOnOutbound: true,
          },
        }
      )
      const outboundPackageAfterPackageAccepted = await prismaService.client.package.findUnique(
        {
          where: { id: outboundPackage.id },
          select: {
            enteredDeliverySystemAt: true,
          },
        }
      )
      for (const rpp of resPhysProdsAfterPackageAccepted) {
        expect(rpp.status).toBe("ScannedOnOutbound")
        expect(rpp.hasBeenScannedOnOutbound).toBe(true)
        testUtils.expectTimeToEqual(rpp.scannedOnOutboundAt, new Date())
      }
      testUtils.expectTimeToEqual(
        outboundPackageAfterPackageAccepted.enteredDeliverySystemAt,
        new Date()
      )

      // Send a post-acceptance transit event. Expect status update.
      const packageDepartedResponse = await request(app.getHttpServer())
        .post("/shippo_events")
        .send(PACKAGE_DEPARTED_TXN_ID_ONE)
      expect(packageDepartedResponse.status).toBe(201)

      const resPhysProdsAfterPackageDeparted = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: { id: { in: resPhysProdIds } },
          select: {
            status: true,
            scannedOnOutboundAt: true,
            hasBeenScannedOnOutbound: true,
          },
        }
      )
      for (const rpp of resPhysProdsAfterPackageDeparted) {
        expect(rpp.status).toBe("InTransitOutbound")
      }

      // Send a delivery event. Expect status update, boolean, timestamp. Expect reservation to move to Delivered as well
      const packageDeliveredResponse = await request(app.getHttpServer())
        .post("/shippo_events")
        .send(PACKAGE_DELIVERED_TXN_ID_ONE)
      expect(packageDeliveredResponse.status).toBe(201)

      const resPhysProdsAfterDelivered = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: { id: { in: resPhysProdIds } },
          select: {
            status: true,
            hasBeenDeliveredToCustomer: true,
            deliveredToCustomerAt: true,
          },
        }
      )
      const reservationAfterDelivered = await prismaService.client.reservation.findUnique(
        { where: { id: reservation.id }, select: { status: true } }
      )
      for (const rpp of resPhysProdsAfterDelivered) {
        expect(rpp.status).toBe("Delivered")
        expect(rpp.hasBeenDeliveredToCustomer).toBe(true)
        testUtils.expectTimeToEqual(rpp.deliveredToCustomerAt, new Date())
      }
      expect(reservationAfterDelivered.status).toBe("Delivered")
    })
  })
})
