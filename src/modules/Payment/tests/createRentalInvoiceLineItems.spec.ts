import { EmailService } from "@app/modules/Email/services/email.service"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { EmailServiceMock } from "@app/modules/Utils/mocks/emailService.mock"
import { PushNotificationServiceMock } from "@app/modules/Utils/mocks/pushNotificationService.mock"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../services/rental.service"
import {
  BASE_PROCESSING_FEE,
  UPS_GROUND_FEE,
  UPS_SELECT_FEE,
  addToBagAndReserveForCustomer,
  createLineItemHash,
  createProcessingObjectKey,
  expectTimeToEqual,
  getCustWithData,
  overridePrices,
  setPackageAmount,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "./utils/utils"
import { Prisma, ShippingCode } from ".prisma/client"

describe("Create Rental Invoice Line Items", () => {
  let timeUtils: TimeUtilsService
  let reservationService: ReservationService
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService

  let testCustomer
  const now = new Date()

  let addToBagAndReserveForCustomerWithParams
  let setReservationCreatedAtWithParams
  let setPackageDeliveredAtWithParams
  let setReservationStatusWithParams
  let getCustWithDataWithParams

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)
    moduleBuilder.overrideProvider(EmailService).useClass(EmailServiceMock)
    moduleBuilder
      .overrideProvider(PushNotificationService)
      .useClass(PushNotificationServiceMock)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)

    addToBagAndReserveForCustomerWithParams = (
      numBagItems,
      { shippingCode } = { shippingCode: "UPSGround" as ShippingCode }
    ) =>
      addToBagAndReserveForCustomer(
        testCustomer,
        numBagItems,
        {
          prisma,
          reservationService,
        },
        { shippingCode }
      )
    getCustWithDataWithParams = (select: Prisma.CustomerSelect = {}) =>
      getCustWithData(testCustomer, {
        prisma,
        select: select,
      })

    setReservationCreatedAtWithParams = (reservationId, numDaysAgo) =>
      setReservationCreatedAt(reservationId, numDaysAgo, {
        prisma,
        timeUtils,
      })
    setPackageDeliveredAtWithParams = (packageId, numDaysAgo) =>
      setPackageDeliveredAt(packageId, numDaysAgo, { prisma, timeUtils })
    setReservationStatusWithParams = (reservationId, status) =>
      setReservationStatus(reservationId, status, { prisma })
  })
  describe("Properly creates line items for an invoice with 3 reservations and 4 products", () => {
    let lineItemsBySUIDOrName
    let expectedResultsBySUIDOrName
    let lineItemsPhysicalProductSUIDs
    let invoicePhysicalProductSUIDs
    let initialReservation
    let reservationTwo
    let reservationThree

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer

      // Two delivered reservations
      initialReservation = await addToBagAndReserveForCustomerWithParams(2)
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")

      reservationTwo = await addToBagAndReserveForCustomerWithParams(1)
      await setReservationCreatedAtWithParams(reservationTwo.id, 10)
      await setPackageDeliveredAtWithParams(reservationTwo.sentPackage.id, 9)
      await setReservationStatusWithParams(reservationTwo.id, "Delivered")

      // One queued reservation
      reservationThree = await addToBagAndReserveForCustomerWithParams(1)
      await setReservationCreatedAtWithParams(reservationTwo.id, 2)

      const initialReservationProductSUIDs = initialReservation.newProducts.map(
        a => a.seasonsUID
      )
      const reservationTwoSUIDs = reservationTwo.newProducts
        .map(b => b.seasonsUID)
        .filter(a => !initialReservationProductSUIDs.includes(a))
      const reservationThreeSUIDs = reservationThree.newProducts
        .map(c => c.seasonsUID)
        .filter(a => !initialReservationProductSUIDs.includes(a))
        .filter(a => !reservationTwoSUIDs.includes(a))

      // Override product prices so we can predict the proper price
      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]
      invoicePhysicalProductSUIDs = rentalInvoice.products.map(
        a => a.seasonsUID
      )

      const allSUIDsInOrder = [
        ...initialReservationProductSUIDs,
        ...reservationTwoSUIDs,
        ...reservationThreeSUIDs,
      ]

      await overridePrices(allSUIDsInOrder, [30, 50, 80, 100], { prisma })

      const rentalInvoiceWithUpdatedPrices = await prisma.client.rentalInvoice.findUnique(
        {
          where: { id: rentalInvoice.id },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        }
      )
      const lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoiceWithUpdatedPrices
      )

      const lineItemsWithData = await prisma.client.rentalInvoiceLineItem.findMany(
        {
          where: { id: { in: (await lineItems).map(a => a.id) } },
          select: {
            physicalProduct: { select: { seasonsUID: true } },
            daysRented: true,
            rentalStartedAt: true,
            rentalEndedAt: true,
            price: true,
            taxName: true,
            taxPercentage: true,
            taxPrice: true,
            taxRate: true,
            comment: true,
            name: true,
          },
        }
      )
      lineItemsPhysicalProductSUIDs = lineItemsWithData
        .filter(a => !!a.physicalProduct)
        .map(a => a.physicalProduct.seasonsUID)

      lineItemsBySUIDOrName = createLineItemHash(lineItemsWithData)

      expectedResultsBySUIDOrName = {
        [initialReservationProductSUIDs[0]]: {
          daysRented: 23,
          rentalStartedAt: timeUtils.xDaysAgoISOString(23),
          rentalEndedAt: now,
          price: 2300,
        },
        [initialReservationProductSUIDs[1]]: {
          daysRented: 23,
          rentalStartedAt: timeUtils.xDaysAgoISOString(23),
          rentalEndedAt: now,
          price: 3841,
        },
        [reservationTwoSUIDs[0]]: {
          daysRented: 9,
          rentalStartedAt: timeUtils.xDaysAgoISOString(9),
          rentalEndedAt: now,
          price: 3204, // expect a minimum charge of 12 days
        },
        [reservationThreeSUIDs[0]]: {
          daysRented: 0,
          rentalStartedAt: null,
          rentalEndedAt: null,
          price: 0,
        },
        // Processing fees:
        // 3 reservations sent, none returned --> paying for 2 sent packages at 700 each. 1st package is on us --> 1400
        // 3 new reservations, 3 * reservation_processing_cost (550) --> 1650
        [createProcessingObjectKey(
          initialReservation.reservationNumber,
          "OutboundPackage"
        )]: {
          price: 0,
        },
        [createProcessingObjectKey(
          reservationTwo.reservationNumber,
          "OutboundPackage"
        )]: {
          price: 700, // 1000 * 30% discount for outbound ground package
        },
        [createProcessingObjectKey(
          reservationThree.reservationNumber,
          "OutboundPackage"
        )]: {
          price: 700, // 1000 * 30% discount for outbound ground package
        },
        [createProcessingObjectKey(
          initialReservation.reservationNumber,
          "Processing"
        )]: {
          price: 550,
        },
        [createProcessingObjectKey(
          reservationTwo.reservationNumber,
          "Processing"
        )]: {
          price: 550,
        },
        [createProcessingObjectKey(
          reservationThree.reservationNumber,
          "Processing"
        )]: {
          price: 550,
        },
      }
    })

    it("Creates a line item for each physical product on the invoice", () => {
      expect(lineItemsPhysicalProductSUIDs.sort()).toEqual(
        invoicePhysicalProductSUIDs.sort()
      )
    })

    it("Stores the proper value of days Rented", () => {
      for (const suid of invoicePhysicalProductSUIDs) {
        expect(lineItemsBySUIDOrName[suid].daysRented).toEqual(
          expectedResultsBySUIDOrName[suid].daysRented
        )
      }
    })

    it("Stores the proper values for rentalStartedAt and rentalEndedAt", () => {
      for (const suid of invoicePhysicalProductSUIDs) {
        const testStart = lineItemsBySUIDOrName[suid]["rentalStartedAt"]
        const expectedStart = expectedResultsBySUIDOrName[suid].rentalStartedAt
        const testEnd = lineItemsBySUIDOrName[suid]["rentalEndedAt"]
        const expectedEnd = expectedResultsBySUIDOrName[suid].rentalEndedAt
        expectTimeToEqual(testStart, expectedStart)
        expectTimeToEqual(testEnd, expectedEnd)
      }
    })

    it("Stores the proper price for physical product line items", () => {
      for (const suid of invoicePhysicalProductSUIDs) {
        const testPrice = lineItemsBySUIDOrName[suid].price
        const expectedPrice = expectedResultsBySUIDOrName[suid].price
        expect(testPrice).toEqual(expectedPrice)
      }
    })

    /* By way of construction, this test covers the following cases
      If a reservation was created but not returned in this billing cycle, we charge the
        base processing fee
      If there are 2 or more new reservations in this billing cycle, we charge for the
        sent package on all but the first
      */
    it("Creates a line item for the first outbound package with a price of 0", () => {
      const key = createProcessingObjectKey(
        initialReservation.reservationNumber,
        "OutboundPackage"
      )
      expect(lineItemsBySUIDOrName[key]).toBeDefined()
      expect(lineItemsBySUIDOrName[key].price).toBe(
        expectedResultsBySUIDOrName[key].price
      )
    })

    it("Creates line items for the 2nd and 3rd outbound packages with nonzero prices", () => {
      const keyTwo = createProcessingObjectKey(
        reservationTwo.reservationNumber,
        "OutboundPackage"
      )
      const keyThree = createProcessingObjectKey(
        reservationThree.reservationNumber,
        "OutboundPackage"
      )

      expect(lineItemsBySUIDOrName[keyTwo]).toBeDefined()
      expect(lineItemsBySUIDOrName[keyTwo].price).toBe(
        expectedResultsBySUIDOrName[keyTwo].price
      )

      expect(lineItemsBySUIDOrName[keyThree]).toBeDefined()
      expect(lineItemsBySUIDOrName[keyThree].price).toBe(
        expectedResultsBySUIDOrName[keyThree].price
      )
    })

    it("Creates processing line items for all three new reservations with proper prices", () => {
      const keyOne = createProcessingObjectKey(
        initialReservation.reservationNumber,
        "Processing"
      )
      const keyTwo = createProcessingObjectKey(
        reservationTwo.reservationNumber,
        "Processing"
      )
      const keyThree = createProcessingObjectKey(
        reservationThree.reservationNumber,
        "Processing"
      )
      for (const key of [keyOne, keyTwo, keyThree]) {
        expect(lineItemsBySUIDOrName[key]).toBeDefined()
        expect(lineItemsBySUIDOrName[key].price).toBe(
          expectedResultsBySUIDOrName[key].price
        )
      }
    })

    it("Doesn't set the taxes on them", () => {
      expect(Object.keys(expectedResultsBySUIDOrName).length).toBeGreaterThan(0)
      for (const id of Object.keys(expectedResultsBySUIDOrName)) {
        expect(lineItemsBySUIDOrName[id].taxPrice).toBe(null)
        expect(lineItemsBySUIDOrName[id].taxRate).toBe(null)
        expect(lineItemsBySUIDOrName[id].taxPercentage).toBe(null)
        expect(lineItemsBySUIDOrName[id].taxName).toBe(null)
      }
    })
  })

  describe("Processing Edge cases", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer
    })

    it("Does not charge any processing fee for a reservation created in a previous billing cycle and held throughout this billing cycle", async () => {
      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 40)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        38
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]
      const lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )

      const processingLineItem = lineItems.find(a =>
        a.name?.includes("Reservation")
      )
      expect(processingLineItem).toBe(undefined)
    })

    it("Charges for the return package if a reservation was created in a previous billing cycle and returned in this one", async () => {
      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 40)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        38
      )
      await setReservationStatusWithParams(initialReservation.id, "Completed")

      await setPackageDeliveredAtWithParams(
        initialReservation.returnPackages[0].id,
        10
      )

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]
      const lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )

      const processingLineItem = lineItems.find(
        a => a.name === "InboundPackage-1"
      )
      expect(processingLineItem).toBeDefined()
      expect(processingLineItem.price).toBe(620) // ground fee of 1000 with a 38% discount
    })

    it("Charges for the return package and base processing fee if a reservation was created and returned in this billing cycle", async () => {
      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Completed")

      await setPackageDeliveredAtWithParams(
        initialReservation.returnPackages[0].id,
        2
      )

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]
      const lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )

      const inboundPackageLineItem = lineItems.find(
        a => a.name === "InboundPackage-1"
      )
      const processingLineItem = lineItems.find(
        a =>
          a.name ===
          "Reservation-" + initialReservation.reservationNumber + "-Processing"
      )

      expect(inboundPackageLineItem).toBeDefined()
      expect(processingLineItem).toBeDefined()

      expect(inboundPackageLineItem.price).toBe(620) // ground fee of 1000 with a 38% discount
      expect(processingLineItem.price).toBe(BASE_PROCESSING_FEE)
    })

    it("Charges for the outbound package if a reservation used a premium shipping option", async () => {
      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2,
        {
          shippingCode: "UPSSelect",
        }
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")
      await setPackageAmount(
        initialReservation.sentPackage.id,
        UPS_SELECT_FEE,
        { prisma }
      )

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]
      const lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )

      const outboundPackageLineItem = lineItems.find(
        a =>
          a.name ===
          "Reservation-" +
            initialReservation.reservationNumber +
            "-OutboundPackage"
      )
      const processingLineItem = lineItems.find(
        a =>
          a.name ===
          "Reservation-" + initialReservation.reservationNumber + "-Processing"
      )

      expect(outboundPackageLineItem).toBeDefined()
      expect(processingLineItem).toBeDefined()

      expect(outboundPackageLineItem.price).toBe(900) // select fee of 2000 with a 55% discount
      expect(processingLineItem.price).toBe(BASE_PROCESSING_FEE)
    })

    /* We once had a bug where we were double charging for inbound packages. */
    it("Charges for each inbound package only once", async () => {
      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Completed")
      await setPackageDeliveredAtWithParams(
        initialReservation.returnPackages[0].id,
        10
      )

      const reservationTwo = await addToBagAndReserveForCustomerWithParams(2)
      await setReservationCreatedAtWithParams(reservationTwo.id, 20)
      await setPackageDeliveredAtWithParams(reservationTwo.sentPackage.id, 18)
      await setReservationStatusWithParams(reservationTwo.id, "Completed")
      await setPackageDeliveredAtWithParams(
        reservationTwo.returnPackages[0].id,
        5
      )

      const reservationThree = await addToBagAndReserveForCustomerWithParams(1)
      await setReservationCreatedAtWithParams(reservationThree.id, 10)
      await setPackageDeliveredAtWithParams(reservationThree.sentPackage.id, 8)
      await setReservationStatusWithParams(reservationThree.id, "Completed")
      await setPackageDeliveredAtWithParams(
        reservationThree.returnPackages[0].id,
        2
      )

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]
      const lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )

      const inboundPackageOneLineItem = lineItems.find(
        a => a.name === "InboundPackage-1"
      )
      const inboundPackageTwoLineItem = lineItems.find(
        a => a.name === "InboundPackage-2"
      )
      const inboundPackageThreeLineItem = lineItems.find(
        a => a.name === "InboundPackage-3"
      )

      for (const lineItem of [
        inboundPackageOneLineItem,
        inboundPackageTwoLineItem,
        inboundPackageThreeLineItem,
      ]) {
        expect(lineItem).toBeDefined()
      }

      const numInboundPackageLineItems = lineItems.filter(a =>
        a.name?.includes("InboundPackage")
      )
      expect(numInboundPackageLineItems.length).toBe(3)
    })
  })

  describe("Package discounts", () => {
    let lineItems
    let initialReservation
    let reservationTwo

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer

      // Create an initial reservation with a UPSSelect shipping code
      initialReservation = await addToBagAndReserveForCustomerWithParams(2, {
        shippingCode: "UPSSelect",
      })
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageAmount(
        initialReservation.sentPackage.id,
        UPS_SELECT_FEE,
        { prisma }
      )

      // Create a second reservation with no such code. Return it
      reservationTwo = await addToBagAndReserveForCustomerWithParams(2)
      await setReservationCreatedAtWithParams(reservationTwo.id, 25)
      await setPackageDeliveredAtWithParams(reservationTwo.sentPackage.id, 18)
      await setPackageDeliveredAtWithParams(
        reservationTwo.returnPackages[0].id,
        5
      )

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]

      lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )
    })
    beforeEach(async () => {})
    // TODO: Inbound package is always ground

    it("Discounts an outbound select package by 55%", async () => {
      const outboundPackageLineItem = lineItems.find(
        a =>
          a.name ===
          "Reservation-" +
            initialReservation.reservationNumber +
            "-OutboundPackage"
      )

      expect(outboundPackageLineItem).toBeDefined()
      expect(outboundPackageLineItem.price).toBe(900) // ups select fee of 2000 with a 55% discount
    })

    it("Discounts an inbound ground package by 38%", () => {
      const inboundPackageLineItem = lineItems.find(
        a => a.name === "InboundPackage-1"
      )
      expect(inboundPackageLineItem).toBeDefined()
      expect(inboundPackageLineItem.price).toBe(620) // ups ground fee of 1000 with a 38% discount
    })

    it("Discounts an outbound ground package by 30%", () => {
      const outboundPackageLineItem = lineItems.find(
        a =>
          a.name ===
          "Reservation-" + reservationTwo.reservationNumber + "-OutboundPackage"
      )

      expect(outboundPackageLineItem).toBeDefined()
      expect(outboundPackageLineItem.price).toBe(700) // ups ground fee of 1000 with a 30% discount
    })
  })
})
