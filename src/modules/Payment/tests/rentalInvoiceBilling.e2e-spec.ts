import { APP_MODULE_DEF } from "@app/app.module"
import {
  ProcessableRentalInvoiceArgs,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { ReservationPhysicalProductService } from "@app/modules/Reservation/services/reservationPhysicalProduct.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { getEventsForTransactionId } from "@app/modules/Shipping/tests/shippoEvents.stub"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import cuid from "cuid"
import Mockdate from "mockdate"
import request from "supertest"

const mockChargebeeInvoiceCreate = () =>
  jest.spyOn<any, any>(chargebee.invoice, "create").mockReturnValue({
    request: () => {
      return {
        invoice: {
          id: cuid(),
          date: Math.round(new Date().getTime() / 1000),
          sub_total: 1000,
          status: "paid",
          line_items: [{}],
        },
      }
    },
  })

describe("Rental Invoice Billing", () => {
  let testUtils: TestUtilsService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let prisma: PrismaService
  let reservationTestUtils: ReservationTestUtilsService
  let rppService: ReservationPhysicalProductService

  let app: INestApplication
  let httpServer

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()
    app = moduleRef.createNestApplication()
    await app.init()
    httpServer = app.getHttpServer()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
    rppService = moduleRef.get<ReservationPhysicalProductService>(
      ReservationPhysicalProductService
    )
  })

  describe("Rents two items and holds them", () => {
    let rentalInvoiceAfterProcessing
    let chargebeeChargeMock

    beforeAll(async () => {
      chargebeeChargeMock = mockChargebeeInvoiceCreate()

      const { customer } = await testUtils.createTestCustomer({
        select: {
          membership: { select: { rentalInvoices: { select: { id: true } } } },
        },
      })
      const {
        reservation,
        bagItems,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer,
        numProductsToAdd: 2,
      })

      await reservationTestUtils.setReservationCreatedAt(reservation.id, 25)

      await rppService.pickItems({ bagItemIds: bagItems.map(b => b.id) })
      await rppService.packItems({ bagItemIds: bagItems.map(b => b.id) })
      const [
        outboundPackage,
        inboundPackage,
      ] = await rppService.generateShippingLabels({
        bagItemIds: bagItems.map(b => b.id),
      })
      await testUtils.setPackageCreatedAt(outboundPackage.id, 25)
      await testUtils.setPackageCreatedAt(inboundPackage.id, 25)

      const outboundPackageWithData = await prisma.client.package.findUnique({
        where: { id: outboundPackage.id },
        select: { transactionID: true },
      })
      const packageEvents = await getEventsForTransactionId(
        outboundPackageWithData.transactionID
      )

      Mockdate.set(timeUtils.xDaysAgo(25))
      await request(httpServer)
        .post("/shippo_events")
        .send(packageEvents["PackageAccepted"])
      Mockdate.reset()
      Mockdate.set(timeUtils.xDaysAgo(24))
      await request(httpServer)
        .post("/shippo_events")
        .send(packageEvents["PackageDeparted"])
      Mockdate.reset()
      Mockdate.set(timeUtils.xDaysAgo(23))
      await request(httpServer)
        .post("/shippo_events")
        .send(packageEvents["Delivered"])
      Mockdate.reset()

      const rentalInvoiceToBill = await prisma.client.rentalInvoice.findUnique({
        where: { id: customer.membership.rentalInvoices[0].id },
        select: ProcessableRentalInvoiceArgs.select,
      })
      await rentalService.processInvoice(rentalInvoiceToBill, {
        forceImmediateCharge: true,
      })

      rentalInvoiceAfterProcessing = await prisma.client.rentalInvoice.findUnique(
        {
          where: { id: rentalInvoiceToBill.id },
          select: {
            status: true,
            chargebeeInvoice: { select: { chargebeeId: true } },
            lineItems: {
              select: {
                name: true,
                price: true,
                physicalProduct: { select: { id: true } },
                daysRented: true,
                rentalEndedAt: true,
                rentalStartedAt: true,
              },
            },
          },
        }
      )
    })

    afterAll(() => {
      chargebeeChargeMock.mockRestore()
    })

    it("Creates line items with proper days rented data", () => {
      const lineItems = rentalInvoiceAfterProcessing.lineItems
      const rentalUsageLineItems = lineItems.filter(
        a => !!a.physicalProduct?.id
      )
      const packageLineItems = lineItems.filter(a => !a.physicalProduct?.id)

      expect(lineItems.length).toBe(3)
      expect(rentalUsageLineItems.length).toBe(2)
      expect(packageLineItems.length).toBe(1)
      for (const li of rentalUsageLineItems) {
        expect(li.daysRented).toBe(23)
        testUtils.expectTimeToEqual(li.rentalStartedAt, timeUtils.xDaysAgo(23))
        testUtils.expectTimeToEqual(li.rentalEndedAt, new Date())
      }

      expect(packageLineItems[0].price).toBe(0)
      expect(
        packageLineItems[0].name.toLowerCase().includes("outbound")
      ).toBeTruthy()
    })

    it("Marks the invoice as billed", () => {
      expect(rentalInvoiceAfterProcessing.status).toBe("Billed")
    })

    it("Calls the chargebee charge func", () => {
      expect(chargebeeChargeMock).toHaveBeenCalledTimes(1)
    })

    it("Creates a chargebee invoice record and connects it to the rental invoice", () => {
      expect(rentalInvoiceAfterProcessing.chargebeeInvoice).toBeDefined()
    })
  })

  // Customer doesn't fill out return flow
  describe("Rents three items and returns two of them before billingEndAt", () => {
    let rentalInvoiceAfterProcessing
    let chargebeeChargeMock
    let returnedSUIDs
    let heldSUID

    beforeAll(async () => {
      chargebeeChargeMock = mockChargebeeInvoiceCreate()

      const { customer } = await testUtils.createTestCustomer({
        select: {
          membership: { select: { rentalInvoices: { select: { id: true } } } },
        },
      })
      const {
        reservation,
        bagItems,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer,
        numProductsToAdd: 3,
        options: {
          bagItemSelect: { physicalProduct: { select: { seasonsUID: true } } },
        },
      })

      await reservationTestUtils.setReservationCreatedAt(reservation.id, 25)

      await rppService.pickItems({ bagItemIds: bagItems.map(b => b.id) })
      await rppService.packItems({ bagItemIds: bagItems.map(b => b.id) })
      const [
        outboundPackage,
        inboundPackage,
      ] = await rppService.generateShippingLabels({
        bagItemIds: bagItems.map(b => b.id),
      })
      await testUtils.setPackageCreatedAt(outboundPackage.id, 25)
      await testUtils.setPackageCreatedAt(inboundPackage.id, 25)

      const outboundPackageWithData = await prisma.client.package.findUnique({
        where: { id: outboundPackage.id },
        select: { transactionID: true },
      })

      const outboundPackageEvents = await getEventsForTransactionId(
        outboundPackageWithData.transactionID
      )
      Mockdate.set(timeUtils.xDaysAgo(25))
      await request(httpServer)
        .post("/shippo_events")
        .send(outboundPackageEvents["PackageAccepted"])
      Mockdate.reset()
      Mockdate.set(timeUtils.xDaysAgo(24))
      await request(httpServer)
        .post("/shippo_events")
        .send(outboundPackageEvents["PackageDeparted"])
      Mockdate.reset()
      Mockdate.set(timeUtils.xDaysAgo(23))
      await request(httpServer)
        .post("/shippo_events")
        .send(outboundPackageEvents["Delivered"])
      Mockdate.reset()

      const inboundPackageWithData = await prisma.client.package.findUnique({
        where: { id: inboundPackage.id },
        select: {
          transactionID: true,
          shippingLabel: { select: { trackingNumber: true } },
        },
      })
      const inboundPackageEvents = await getEventsForTransactionId(
        inboundPackageWithData.transactionID
      )
      Mockdate.set(timeUtils.xDaysAgo(5))
      await request(httpServer)
        .post("/shippo_events")
        .send(inboundPackageEvents["PackageAccepted"])
      Mockdate.reset()
      Mockdate.set(timeUtils.xDaysAgo(4))
      await request(httpServer)
        .post("/shippo_events")
        .send(inboundPackageEvents["PackageDeparted"])
      Mockdate.reset()
      Mockdate.set(timeUtils.xDaysAgo(2))
      await request(httpServer)
        .post("/shippo_events")
        .send(inboundPackageEvents["Delivered"])

      returnedSUIDs = bagItems.map(b => b.physicalProduct).slice(0, 2)
      heldSUID = bagItems.map(b => b.physicalProduct)[2]
      await rppService.processReturn({
        droppedOffBy: "UPS",
        trackingNumber: inboundPackageWithData.shippingLabel.trackingNumber,
        customerId: customer.id,
        productStates: returnedSUIDs.map(a => ({
          productUID: a.seasonsUID,
          returned: true,
          notes: "none",
          productStatus: "Dirty",
        })),
      })

      Mockdate.reset()

      const rentalInvoiceToBill = await prisma.client.rentalInvoice.findUnique({
        where: { id: customer.membership.rentalInvoices[0].id },
        select: ProcessableRentalInvoiceArgs.select,
      })
      await rentalService.processInvoice(rentalInvoiceToBill, {
        forceImmediateCharge: true,
        onError: err => {
          console.log(err)
        },
      })

      rentalInvoiceAfterProcessing = await prisma.client.rentalInvoice.findUnique(
        {
          where: { id: rentalInvoiceToBill.id },
          select: {
            status: true,
            chargebeeInvoice: { select: { chargebeeId: true } },
            lineItems: {
              select: {
                name: true,
                price: true,
                physicalProduct: { select: { id: true, seasonsUID: true } },
                daysRented: true,
                rentalEndedAt: true,
                rentalStartedAt: true,
              },
            },
          },
        }
      )
    })

    afterAll(() => {
      chargebeeChargeMock.mockRestore()
    })

    it("Creates line items with proper days rented and package data", () => {
      const lineItems = rentalInvoiceAfterProcessing.lineItems
      const rentalUsageLineItems = lineItems.filter(
        a => !!a.physicalProduct?.id
      )
      const packageLineItems = lineItems.filter(a => !a.physicalProduct?.id)
      expect(lineItems.length).toBe(5)
      expect(rentalUsageLineItems.length).toBe(3)
      expect(packageLineItems.length).toBe(2)

      const heldItemLI = rentalUsageLineItems.find(
        a => a.physicalProduct.seasonsUID === heldSUID.seasonsUID
      )
      expect(heldItemLI.daysRented).toBe(23)
      testUtils.expectTimeToEqual(
        heldItemLI.rentalStartedAt,
        timeUtils.xDaysAgo(23)
      )
      testUtils.expectTimeToEqual(heldItemLI.rentalEndedAt, new Date())

      const returnedItemLIs = rentalUsageLineItems.filter(a =>
        returnedSUIDs
          .map(b => b.seasonsUID)
          .includes(a.physicalProduct.seasonsUID)
      )
      for (const li of returnedItemLIs) {
        expect(li.daysRented).toBe(18)
        testUtils.expectTimeToEqual(li.rentalStartedAt, timeUtils.xDaysAgo(23))
        testUtils.expectTimeToEqual(li.rentalEndedAt, timeUtils.xDaysAgo(5))
      }

      const inboundPackageLineItem = packageLineItems.find(a =>
        a.name.toLowerCase().includes("inboundpackage")
      )
      expect(inboundPackageLineItem.price).toBeGreaterThan(0)

      const outboundPackageLineItem = packageLineItems.find(a =>
        a.name.toLowerCase().includes("outbound package")
      )
      expect(outboundPackageLineItem.price).toBe(0)
    })

    it("Marks the invoice as billed", () => {
      expect(rentalInvoiceAfterProcessing.status).toBe("Billed")
    })

    it("Calls the chargebee charge func", () => {
      expect(chargebeeChargeMock).toHaveBeenCalledTimes(1)
    })

    it("Creates a chargebee invoice record and connects it to the rental invoice", () => {
      expect(rentalInvoiceAfterProcessing.chargebeeInvoice).toBeDefined()
    })
  })

  describe("Lost on the way there", () => {
    // TODO: 1. Truly Lost. 2. Found with the customer
  })

  describe("Lost on the way back", () => {
    // TODO: 1. Truly Lost. 2. Found with us
  })

  describe("Rents three items, returns two of them incl. filling out return flow", () => {
    // TODO: Billed after all items return and are processed. 2. Billed after package comes inbound but one item is marked as not returned.
    // TODO: Billed while items in transit. BOth items do end up returning back.
    // TODO: Billed while items in transit, one item ends up not coming back.
  })

  // TODO:
  describe("Reserved 3 items, cancelled one", () => {})

  // TODO:
  describe("Swapped out an item", () => {})
})
