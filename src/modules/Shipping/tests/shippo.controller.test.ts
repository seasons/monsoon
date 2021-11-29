import { APP_MODULE_DEF } from "@app/app.module"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { Reservation } from "@prisma/client"
import e from "apollo-server-express/node_modules/@types/express"
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

const PACKAGE_ACCEPTED_TXN_ID_TWO = TRANSACTION_ID_TWO_EVENTS["PackageAccepted"]
const PACKAGE_DEPARTED_TXN_ID_TWO = TRANSACTION_ID_TWO_EVENTS["PackageDeparted"]
const PACKAGE_DELIVERED_TXN_ID_TWO = TRANSACTION_ID_ONE_EVENTS["Delivered"]

describe("Shippo Controller", () => {
  let app: INestApplication
  let prismaService: PrismaService
  let testUtils: TestUtilsService
  let reservationTestUtils: ReservationTestUtilsService
  let httpServer

  let cleanupFuncs = []

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(APP_MODULE_DEF).compile()

    app = moduleRef.createNestApplication()
    await app.init()
    httpServer = app.getHttpServer()

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

    beforeEach(async () => {
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

    test("Package Accepted event sets ScannedOnOutbound + associated boolean/timestamp, enteredDeliverySystemAt on package", async () => {
      const packageAcceptedResponse = await request(httpServer)
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
    })

    test("Package Departed event sets InTransitOutbound", async () => {
      const packageDepartedResponse = await request(httpServer)
        .post("/shippo_events")
        .send(PACKAGE_DEPARTED_TXN_ID_ONE)
      expect(packageDepartedResponse.status).toBe(201)

      const resPhysProdsAfterPackageDeparted = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: { id: { in: resPhysProdIds } },
          select: {
            status: true,
          },
        }
      )
      for (const rpp of resPhysProdsAfterPackageDeparted) {
        expect(rpp.status).toBe("InTransitOutbound")
      }
    })

    test("Delivered event sets DeliveredToCustomer + associated boolean/timestamp, Delivered status on reservation, deliveredAt timestamp on package", async () => {
      const packageDeliveredResponse = await request(httpServer)
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
        expect(rpp.status).toBe("DeliveredToCustomer")
        expect(rpp.hasBeenDeliveredToCustomer).toBe(true)
        testUtils.expectTimeToEqual(rpp.deliveredToCustomerAt, new Date())
      }
      expect(reservationAfterDelivered.status).toBe("Delivered")
    })
  })

  describe("Inbound Package", () => {
    let reservation
    let inboundPackage
    let returnedRPPIds
    let heldRPPId
    let rppIds

    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer()

      ;({
        reservation,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer,
        numProductsToAdd: 3,
      }))

      // Mock AtHome state, with return flow filled out for two items
      rppIds = reservation.reservationPhysicalProducts.map(a => a.id)
      heldRPPId = rppIds[0]
      returnedRPPIds = rppIds.slice(1)
      await prismaService.client.reservationPhysicalProduct.update({
        where: {
          id: heldRPPId,
        },
        data: { status: "AtHome" },
      })
      await prismaService.client.reservationPhysicalProduct.updateMany({
        where: {
          id: { in: returnedRPPIds },
        },
        data: { status: "ReturnPending" },
      })

      inboundPackage = await prismaService.client.package.create({
        data: {
          transactionID: TRANSACTION_ID_TWO,
          reservationOnReturnPackages: { connect: { id: reservation.id } },
        },
      })
    })

    test(
      "Package Accepted event sets ScannedOnInbound + associated boolean/timestamp, enteredDeliverySystemAt on package." +
        "Correctly ties ReturnPending items to package",
      async () => {
        const packageAcceptedResponse = await request(httpServer)
          .post("/shippo_events")
          .send(PACKAGE_ACCEPTED_TXN_ID_TWO)
        expect(packageAcceptedResponse.status).toBe(201)

        const resPhysProdsAfterPackageAccepted = await prismaService.client.reservationPhysicalProduct.findMany(
          {
            where: { id: { in: rppIds } },
            select: {
              id: true,
              status: true,
              scannedOnInboundAt: true,
              hasBeenScannedOnInbound: true,
              physicalProduct: {
                select: { id: true },
              },
            },
          }
        )
        const inboundPackageAfterPackageAccepted = await prismaService.client.package.findUnique(
          {
            where: { id: inboundPackage.id },
            select: {
              enteredDeliverySystemAt: true,
              items: { select: { id: true } },
              reservationPhysicalProductsOnInboundPackage: {
                select: { id: true },
              },
            },
          }
        )
        const heldRpp = resPhysProdsAfterPackageAccepted.find(
          a => a.id === heldRPPId
        )
        const returnedRPPs = resPhysProdsAfterPackageAccepted.filter(a =>
          returnedRPPIds.includes(a.id)
        )

        // Held RPP didn't change
        expect(heldRpp.status).toBe("AtHome")
        expect(heldRpp.hasBeenScannedOnInbound).toBe(false)
        expect(heldRpp.scannedOnInboundAt).toBe(null)

        // Returned RPPs updated
        for (const rpp of returnedRPPs) {
          expect(rpp.status).toBe("ScannedOnInbound")
          expect(rpp.hasBeenScannedOnInbound).toBe(true)
          testUtils.expectTimeToEqual(rpp.scannedOnInboundAt, new Date())
        }

        // Package updated properly
        testUtils.expectTimeToEqual(
          inboundPackageAfterPackageAccepted.enteredDeliverySystemAt,
          new Date()
        )
        expect(inboundPackageAfterPackageAccepted.items.length).toBe(2)
        expect(
          inboundPackageAfterPackageAccepted
            .reservationPhysicalProductsOnInboundPackage.length
        ).toBe(2)
        inboundPackageAfterPackageAccepted.items.forEach(b =>
          expect(
            returnedRPPs.map(a => a.physicalProduct.id).includes(b.id)
          ).toBe(true)
        )
        inboundPackageAfterPackageAccepted.reservationPhysicalProductsOnInboundPackage.forEach(
          a => expect(returnedRPPIds.includes(a.id)).toBe(true)
        )
      }
    )

    test("Package Departed event sets InTransitOutbound on returned items", async () => {
      const packageDepartedResponse = await request(httpServer)
        .post("/shippo_events")
        .send(PACKAGE_DEPARTED_TXN_ID_TWO)
      expect(packageDepartedResponse.status).toBe(201)

      const resPhysProdsAfterPackageDeparted = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: { id: { in: rppIds } },
          select: {
            id: true,
            status: true,
          },
        }
      )
      const returnedRPPs = resPhysProdsAfterPackageDeparted.filter(a =>
        returnedRPPIds.includes(a.id)
      )
      for (const rpp of returnedRPPs) {
        expect(rpp.status).toBe("InTransitInbound")
      }
    })

    test("Delivered event sets DeliveredToBusiness + associated boolean/timestamp on returned items, deliveredAt timestamp on package", async () => {
      const packageDeliveredResponse = await request(httpServer)
        .post("/shippo_events")
        .send(PACKAGE_DELIVERED_TXN_ID_TWO)
      expect(packageDeliveredResponse.status).toBe(201)

      const resPhysProdsAfterDelivered = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: { id: { in: rppIds } },
          select: {
            id: true,
            status: true,
            deliveredToBusinessAt: true,
            hasBeenDeliveredToBusiness: true,
          },
        }
      )
      const inboundPackageAfterDelivered = await prismaService.client.package.findUnique(
        {
          where: { id: inboundPackage.id },
          select: {
            deliveredAt: true,
          },
        }
      )
      const returnedRPPs = resPhysProdsAfterDelivered.filter(a =>
        returnedRPPIds.includes(a.id)
      )
      for (const rpp of returnedRPPs) {
        expect(rpp.status).toBe("DeliveredToBusiness")
        expect(rpp.hasBeenDeliveredToBusiness).toBe(true)
        testUtils.expectTimeToEqual(rpp.deliveredToBusinessAt, new Date())
      }
      testUtils.expectTimeToEqual(
        inboundPackageAfterDelivered.deliveredAt,
        new Date()
      )
    })
  })
})
