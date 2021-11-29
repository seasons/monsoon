import { APP_MODULE_DEF } from "@app/app.module"
import { PushNotificationService } from "@app/modules/PushNotification"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import cuid from "cuid"
import request from "supertest"

import { getEventsForTransactionId } from "./shippoEvents.stub"

// TODO: Add test that events get connected to package
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

    let packageEvents
    const txnId = cuid()

    beforeAll(() => {
      packageEvents = getEventsForTransactionId(txnId)
    })

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
          transactionID: txnId,
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
      const event = packageEvents["PackageAccepted"]
      const packageAcceptedResponse = await request(httpServer)
        .post("/shippo_events")
        .send(event)
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
      const event = packageEvents["PackageDeparted"]
      const packageDepartedResponse = await request(httpServer)
        .post("/shippo_events")
        .send(event)
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
      const event = packageEvents["Delivered"]
      const packageDeliveredResponse = await request(httpServer)
        .post("/shippo_events")
        .send(event)
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

    let packageEvents

    const txnId = cuid()

    beforeAll(() => {
      packageEvents = getEventsForTransactionId(txnId)
    })

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

      await prismaService.client.package.create({
        data: {
          transactionID: cuid(),
          reservationOnSentPackage: { connect: { id: reservation.id } },
        },
      })
      inboundPackage = await prismaService.client.package.create({
        data: {
          transactionID: txnId,
          reservationOnReturnPackages: { connect: { id: reservation.id } },
        },
      })
    })

    test(
      "Package Accepted event sets ScannedOnInbound + associated boolean/timestamp, enteredDeliverySystemAt on package." +
        "Correctly ties ReturnPending items to package. Sets phase on reservation.",
      async () => {
        const event = packageEvents["PackageAccepted"]
        const packageAcceptedResponse = await request(httpServer)
          .post("/shippo_events")
          .send(event)
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
        const reservationAfterPackageAccepted = await prismaService.client.reservation.findUnique(
          { where: { id: reservation.id }, select: { phase: true } }
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

        expect(reservationAfterPackageAccepted.phase).toBe("CustomerToBusiness")
      }
    )

    test("Package Departed event sets InTransitOutbound on returned items", async () => {
      const event = packageEvents["PackageDeparted"]
      const packageDepartedResponse = await request(httpServer)
        .post("/shippo_events")
        .send(event)
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
      const event = packageEvents["Delivered"]
      const packageDeliveredResponse = await request(httpServer)
        .post("/shippo_events")
        .send(event)
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

  it("Connects package transit events to the package", async () => {
    const txnId = cuid()
    const packageEvents = getEventsForTransactionId(txnId)

    const { customer } = await testUtils.createTestCustomer()

    const {
      reservation,
    } = await reservationTestUtils.addToBagAndReserveForCustomer({
      customer,
      numProductsToAdd: 3,
    })

    const outboundPackage = await prismaService.client.package.create({
      data: {
        transactionID: txnId,
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
      select: { id: true, events: { select: { id: true } } },
    })
    expect(outboundPackage.events.length).toBe(0)

    const event = packageEvents["PackageAccepted"]
    const packageAcceptedResponse = await request(httpServer)
      .post("/shippo_events")
      .send(event)
    expect(packageAcceptedResponse.status).toBe(201)

    const packageAfterEvent = await prismaService.client.package.findUnique({
      where: { id: outboundPackage.id },
      select: { events: { select: { id: true } } },
    })
    expect(packageAfterEvent.events.length).toBe(1)
  })
})
