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
const PACKAGE_ACCEPTED_TXN_ID_TWO = TRANSACTION_ID_TWO_EVENTS["PackageAccepted"]
const PACKAGE_DELIVERED_TXN_ID_TWO = TRANSACTION_ID_TWO_EVENTS["Delivered"]

describe("Shippo Controller", () => {
  let app: INestApplication
  let prismaService: PrismaService
  let testUtils: TestUtilsService
  let reservationTestUtils: ReservationTestUtilsService

  let testReservation: Partial<Reservation>

  let cleanupFuncs = []

  beforeAll(async () => {
    // Create the test module and initalize the app
    const moduleRef = await Test.createTestingModule(APP_MODULE_DEF).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    prismaService = moduleRef.get<PrismaService>(PrismaService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )

    // Send an event that won't interfere with other tests, while allowing us to test
    // the connection between package transit events and reservations
    return request(app.getHttpServer())
      .post("/shippo_events")
      .send(PACKAGE_ACCEPTED_TXN_ID_TWO)
      .expect(201)
  })

  afterAll(async () => {
    await Promise.all(cleanupFuncs.map(a => a()))
    app.close()
  })

  describe("Outbound Package", () => {
    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer()
      const {
        reservation,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer,
        numProductsToAdd: 3,
      })

      // Mock Packed state
      await prismaService.client.reservationPhysicalProduct.updateMany({
        where: {
          id: { in: reservation.reservationPhysicalProducts.map(a => a.id) },
        },
        data: { status: "Packed", outboundPackageId: "" },
      })

      /*
    Mark all the items as Packed. Set their outbound package
    */

      expect((testReservation as any).packageEvents.length).toBe(0)
    })
  })

  it("attaches package transit events to reservations", async () => {
    const testReservationWithData = await prismaService.client.reservation.findFirst(
      {
        where: { id: testReservation.id },
        select: {
          packageEvents: { select: { id: true } },
        },
      }
    )
    expect(testReservationWithData.packageEvents.length).toBeGreaterThan(0)
  })

  describe("Package Accepted event", () => {
    beforeAll(async () => {
      // expect enteredDeliverySystemAt to be null on sent package before sending event
      const testReservationWithData = await prismaService.client.reservation.findFirst(
        {
          where: { id: testReservation.id },
          select: {
            sentPackage: {
              select: { id: true, enteredDeliverySystemAt: true },
            },
          },
        }
      )
      expect(testReservationWithData.sentPackage.enteredDeliverySystemAt).toBe(
        null
      )

      return request(app.getHttpServer())
        .post("/shippo_events")
        .send(PACKAGE_ACCEPTED_TXN_ID_ONE)
        .expect(201)
    })

    it("sets the enteredDeliverySystemAt timestamp on a sent package", async () => {
      const testReservationWithData = await prismaService.client.reservation.findFirst(
        {
          where: { id: testReservation.id },
          select: {
            id: true,
            sentPackage: {
              select: { id: true, enteredDeliverySystemAt: true },
            },
          },
        }
      )
      const fieldIsDate =
        testReservationWithData.sentPackage.enteredDeliverySystemAt instanceof
        Date
      expect(fieldIsDate).toBe(true)
      return
    })
  })

  describe("Delivered event", () => {
    beforeAll(async () => {
      // expect deliveredAt to be null on return package before sending event
      const testReservationWithData = await prismaService.client.reservation.findFirst(
        {
          where: { id: testReservation.id },
          select: {
            returnPackages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, deliveredAt: true },
            },
          },
        }
      )
      const returnPackage = testReservationWithData.returnPackages[0]
      expect(returnPackage.deliveredAt).toBe(null)

      return request(app.getHttpServer())
        .post("/shippo_events")
        .send(PACKAGE_DELIVERED_TXN_ID_TWO)
        .expect(201)
    })

    it("sets the deliveredAt timestamp on a return package", async () => {
      const testReservationWithData = await prismaService.client.reservation.findFirst(
        {
          where: { id: testReservation.id },
          select: {
            id: true,
            returnPackages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, deliveredAt: true },
            },
          },
        }
      )
      const returnPackage = testReservationWithData.returnPackages[0]
      const fieldIsDate = returnPackage.deliveredAt instanceof Date
      expect(fieldIsDate).toBe(true)
      return
    })
  })
})
