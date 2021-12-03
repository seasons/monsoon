import { APP_MODULE_DEF } from "@app/app.module"
import {
  ProcessableRentalInvoiceSelect,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { ReservationPhysicalProductService } from "@app/modules/Reservation/services/reservationPhysicalProduct.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { getEventsForTransactionId } from "@app/modules/Shipping/tests/shippoEvents.stub"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import Mockdate from "mockdate"
import request from "supertest"

describe("Rental Invoice Billing", () => {
  let testUtils: TestUtilsService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let shipping: ShippingService
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
    shipping = moduleRef.get<ShippingService>(ShippingService)
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
      chargebeeChargeMock = jest
        .spyOn<any, any>(chargebee.invoice, "create")
        .mockReturnValue({
          request: () => {
            return {
              invoice: {
                line_items: [{}],
              },
            }
          },
        })

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

      reservationTestUtils.setReservationCreatedAt(
        reservation,
        timeUtils.xDaysAgo(25)
      )

      await rppService.pickItems({ bagItemIds: bagItems.map(b => b.id) })
      await rppService.packItems({ bagItemIds: bagItems.map(b => b.id) })
      const [outboundPackage] = await rppService.generateShippingLabels({
        bagItemIds: bagItems.map(b => b.id),
      })

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
      Mockdate.set(timeUtils.xDaysAgo(24))
      await request(httpServer)
        .post("/shippo_events")
        .send(packageEvents["PackageDeparted"])
      Mockdate.set(timeUtils.xDaysAgo(23))
      await request(httpServer)
        .post("/shippo_events")
        .send(packageEvents["Delivered"])
      Mockdate.reset()

      const rentalInvoiceToBill = await prisma.client.rentalInvoice.findUnique({
        where: { id: customer.membership.rentalInvoices[0].id },
        select: ProcessableRentalInvoiceSelect,
      })
      await rentalService.processInvoice(rentalInvoiceToBill, {
        forceImmediateCharge: true,
      })

      rentalInvoiceAfterProcessing = await prisma.client.rentalInvoice.findUnique(
        {
          where: { id: rentalInvoiceToBill.id },
          select: {
            status: true,
            lineItems: {
              select: {
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

    it("Creates line items with proper days rented data", () => {
      const lineItems = rentalInvoiceAfterProcessing.lineItems
      const rentalUsageLineItems = lineItems.filter(
        a => !!a.physicalProduct?.id
      )

      expect(rentalUsageLineItems.length).toBe(2)
      for (const li of rentalUsageLineItems) {
        expect(li.daysRented).toBe(23)
        expect(li.rentalStartedAt).toBe(timeUtils.xDaysAgo(23))
        expect(li.rentalEndedAt).toBe(new Date())
      }
    })

    it("Marks the invoice as billed", () => {
      expect(rentalInvoiceAfterProcessing.status).toBe("Billed")
    })

    it("Calls the chargebee charge func", () => {
      expect(chargebeeChargeMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("Rents three items and returns two of them before billingEndAt", () => {})

  describe("Rents two items and they get lost on the way there", () => {})

  describe("Rents three items and one gets lost on the way back", () => {})
})
