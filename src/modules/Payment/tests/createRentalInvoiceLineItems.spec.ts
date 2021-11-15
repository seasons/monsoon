import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../services/rental.service"
import {
  UPS_SELECT_FEE,
  addToBagAndReserveForCustomer,
  createLineItemHash,
  createProcessingObjectKey,
  expectTimeToEqual,
  getCustWithData,
  overridePrices,
  setPackageAmount,
  setPackageCreatedAt,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "./utils/utils"
import { Prisma, ShippingCode } from ".prisma/client"

describe("Create Rental Invoice Line Items", () => {
  let timeUtils: TimeUtilsService
  let reserveService: ReserveService
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
  let setPackageEnteredSystemAtWithParams
  let setPackageCreatedAtWithParams

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)

    setPackageCreatedAtWithParams = (packageId, date) =>
      setPackageCreatedAt(packageId, date, { prisma, timeUtils })
    addToBagAndReserveForCustomerWithParams = (
      numBagItems,
      { shippingCode } = { shippingCode: "UPSGround" as ShippingCode }
    ) =>
      addToBagAndReserveForCustomer(
        testCustomer,
        numBagItems,
        {
          prisma,
          reserveService,
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
    setPackageEnteredSystemAtWithParams = (packageId, numDaysAgo) =>
      setPackageEnteredSystemAt(packageId, numDaysAgo, { prisma, timeUtils })
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
      await setPackageEnteredSystemAtWithParams(
        initialReservation.sentPackage.id,
        25
      )
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")

      reservationTwo = await addToBagAndReserveForCustomerWithParams(1)
      await setReservationCreatedAtWithParams(reservationTwo.id, 10)
      await setPackageEnteredSystemAtWithParams(
        reservationTwo.sentPackage.id,
        10
      )
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
        // Shipping fees:
        // 3 reservations sent, none returned --> paying for 2 sent packages at 700 each. 1st package is on us --> 1400
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
          price: 0, // Hasn't been shipped out yet
          comment:
            "Reservation 3 of billing cycle. Package did not ship before invoice billed. No charge.",
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

    it("Creates a line item for the 2nd outbound package with a nonzero price", () => {
      const keyTwo = createProcessingObjectKey(
        reservationTwo.reservationNumber,
        "OutboundPackage"
      )

      expect(lineItemsBySUIDOrName[keyTwo]).toBeDefined()
      expect(lineItemsBySUIDOrName[keyTwo].price).toBe(
        expectedResultsBySUIDOrName[keyTwo].price
      )
    })

    it("Creates a line item for the 3rd outbound package with a zero price because it hasn't been shipped yet", () => {
      const keyThree = createProcessingObjectKey(
        reservationThree.reservationNumber,
        "OutboundPackage"
      )

      expect(lineItemsBySUIDOrName[keyThree]).toBeDefined()
      expect(lineItemsBySUIDOrName[keyThree].price).toBe(
        expectedResultsBySUIDOrName[keyThree].price
      )
      expect(lineItemsBySUIDOrName[keyThree].comment).toBe(
        expectedResultsBySUIDOrName[keyThree].comment
      )
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

  describe("Package Edge cases", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer
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

      const inboundPackageLineItem = lineItems.find(
        a => a.name === "InboundPackage-1"
      )
      expect(inboundPackageLineItem).toBeDefined()
      expect(inboundPackageLineItem.price).toBe(620) // ground fee of 1000 with a 38% discount
    })

    it("Charges for the return package if a reservation was created and returned in this billing cycle", async () => {
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

      expect(inboundPackageLineItem).toBeDefined()
      expect(inboundPackageLineItem.price).toBe(620) // ground fee of 1000 with a 38% discount
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
      await setPackageEnteredSystemAtWithParams(
        initialReservation.sentPackage.id,
        25
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

      expect(outboundPackageLineItem).toBeDefined()
      expect(outboundPackageLineItem.price).toBe(900) // select fee of 2000 with a 55% discount
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
      await setPackageEnteredSystemAtWithParams(
        initialReservation.sentPackage.id,
        25
      )
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
      await setPackageEnteredSystemAtWithParams(
        reservationTwo.sentPackage.id,
        25
      )

      const custWithData = (await getCustWithDataWithParams()) as any
      const rentalInvoice = custWithData.membership.rentalInvoices[0]

      lineItems = await rentalService.createRentalInvoiceLineItems(
        rentalInvoice
      )
    })

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

  describe("Outbound packages", () => {
    describe("Reservation and packages created in this billing cycle", () => {
      beforeEach(async () => {
        const { customer } = await testUtils.createTestCustomer({
          select: { id: true },
        })
        testCustomer = customer
      })
      it("If a customer picked up their reservation, do not charge for the outbound package", async () => {
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "Pickup",
          }
        )
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setReservationStatusWithParams(initialReservation.id, "Delivered")

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const outboundPackageLineItemName = createProcessingObjectKey(
          initialReservation.reservationNumber,
          "OutboundPackage"
        )

        const outboundPackageLineItem = lineItems.find(
          a => a.name === outboundPackageLineItemName
        )

        const pickupPackageLineItemName = createProcessingObjectKey(
          initialReservation.reservationNumber,
          "Pickup"
        )

        const pickupPackageLineItem = lineItems.find(
          a => a.name === pickupPackageLineItemName
        )

        expect(outboundPackageLineItem).toBeUndefined()
        expect(pickupPackageLineItem).toBeDefined()
        expect(pickupPackageLineItem.price).toBe(0)
        expect(pickupPackageLineItem.comment).toBe(
          "Reservation 1 of billing cycle. Customer picked up package. No charge."
        )
      })

      it("If a customer picks up their first reservation, and their second reservation, and then has the third one shipped ground, do not charge him on the third reservation.", async () => {
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "Pickup",
          }
        )
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setReservationStatusWithParams(initialReservation.id, "Delivered")

        const secondReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "Pickup",
          }
        )
        await setReservationCreatedAtWithParams(secondReservation.id, 15)
        await setReservationStatusWithParams(secondReservation.id, "Delivered")

        const thirdReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(thirdReservation.id, 8)
        await setPackageDeliveredAtWithParams(
          thirdReservation.sentPackage.id,
          6
        )
        await setPackageEnteredSystemAtWithParams(
          thirdReservation.sentPackage.id,
          8
        )
        await setReservationStatusWithParams(thirdReservation.id, "Delivered")

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const outboundPackageLineItemName = createProcessingObjectKey(
          thirdReservation.reservationNumber,
          "OutboundPackage"
        )
        const outboundPackageLineItem = lineItems.find(
          a => a.name === outboundPackageLineItemName
        )
        expect(outboundPackageLineItem).toBeDefined()
        expect(outboundPackageLineItem.price).toBe(0)
        expect(outboundPackageLineItem.comment).toBe(
          "Reservation 3 of billing cycle. First active outbound package of billing cycle. Did not use premium shipping. Do not charge."
        )
      })

      it("If a customer picks up their first reservation, and their second reservation, and then has the third one shipped select, charge him on the third reservation", async () => {
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "Pickup",
          }
        )
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setReservationStatusWithParams(initialReservation.id, "Delivered")

        const secondReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "Pickup",
          }
        )
        await setReservationCreatedAtWithParams(secondReservation.id, 15)
        await setReservationStatusWithParams(secondReservation.id, "Delivered")

        const thirdReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSSelect",
          }
        )
        await setReservationCreatedAtWithParams(thirdReservation.id, 8)
        await setPackageDeliveredAtWithParams(
          thirdReservation.sentPackage.id,
          6
        )
        await setPackageEnteredSystemAtWithParams(
          thirdReservation.sentPackage.id,
          8
        )
        await setReservationStatusWithParams(thirdReservation.id, "Delivered")

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const outboundPackageLineItemName = createProcessingObjectKey(
          thirdReservation.reservationNumber,
          "OutboundPackage"
        )
        const outboundPackageLineItem = lineItems.find(
          a => a.name === outboundPackageLineItemName
        )
        expect(outboundPackageLineItem).toBeDefined()
        expect(outboundPackageLineItem.price).toBe(900) // 2000 with 55% discount
      })

      it("If a customer only has one shipped (ground) outbound package in this billing cycle, do not charge him", async () => {
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setReservationStatusWithParams(initialReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          initialReservation.sentPackage.id,
          23
        )
        await setPackageEnteredSystemAtWithParams(
          initialReservation.sentPackage.id,
          25
        )

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const outboundPackageLineItemName = createProcessingObjectKey(
          initialReservation.reservationNumber,
          "OutboundPackage"
        )
        const outboundPackageLineItem = lineItems.find(
          a => a.name === outboundPackageLineItemName
        )
        expect(outboundPackageLineItem).toBeDefined()
        expect(outboundPackageLineItem.price).toBe(0)
      })

      it("If a customer only has one shipped, select package in this billing cycle, charge him", async () => {
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSSelect",
          }
        )
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setReservationStatusWithParams(initialReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          initialReservation.sentPackage.id,
          23
        )
        await setPackageEnteredSystemAtWithParams(
          initialReservation.sentPackage.id,
          25
        )

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const outboundPackageLineItemName = createProcessingObjectKey(
          initialReservation.reservationNumber,
          "OutboundPackage"
        )
        const outboundPackageLineItem = lineItems.find(
          a => a.name === outboundPackageLineItemName
        )
        expect(outboundPackageLineItem).toBeDefined()
        expect(outboundPackageLineItem.price).toBe(900) // 2000 with 55% discount
      })

      it("If a customer's first outbound package is select, and the second outbound package is ground, charge him for both", async () => {
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSSelect",
          }
        )
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setReservationStatusWithParams(initialReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          initialReservation.sentPackage.id,
          23
        )
        await setPackageEnteredSystemAtWithParams(
          initialReservation.sentPackage.id,
          25
        )

        const secondReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(secondReservation.id, 15)
        await setReservationStatusWithParams(secondReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          secondReservation.sentPackage.id,
          13
        )
        await setPackageEnteredSystemAtWithParams(
          secondReservation.sentPackage.id,
          15
        )

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const firstOutboundPackageLineItemName = createProcessingObjectKey(
          initialReservation.reservationNumber,
          "OutboundPackage"
        )
        const firstOutboundPackageLineItem = lineItems.find(
          a => a.name === firstOutboundPackageLineItemName
        )
        const secondOutboundPackageLineItemName = createProcessingObjectKey(
          secondReservation.reservationNumber,
          "OutboundPackage"
        )
        const secondOutboundPackageLineItem = lineItems.find(
          a => a.name === secondOutboundPackageLineItemName
        )
        expect(firstOutboundPackageLineItem).toBeDefined()
        expect(firstOutboundPackageLineItem.price).toBe(900) // 2000 with 55% discount
        expect(secondOutboundPackageLineItem).toBeDefined()
        expect(secondOutboundPackageLineItem.price).toBe(700) // 1000 with a 30% discount
      })

      it("If a customer placed 3 reservations in the same day and chose ground shipping, then never reserved anything else in the billing cycle, do not charge him", async () => {
        const firstReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(firstReservation.id, 25)
        await setReservationStatusWithParams(firstReservation.id, "Completed")
        const secondReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(secondReservation.id, 25)
        await setReservationStatusWithParams(secondReservation.id, "Completed")
        const thirdReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(thirdReservation.id, 25)
        await setReservationStatusWithParams(thirdReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          thirdReservation.sentPackage.id,
          23
        )
        await setPackageEnteredSystemAtWithParams(
          thirdReservation.sentPackage.id,
          25
        )

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const firstOutboundPackageLineItemName = createProcessingObjectKey(
          firstReservation.reservationNumber,
          "OutboundPackage"
        )
        const firstOutboundPackageLineItem = lineItems.find(
          a => a.name === firstOutboundPackageLineItemName
        )
        const secondOutboundPackageLineItemName = createProcessingObjectKey(
          secondReservation.reservationNumber,
          "OutboundPackage"
        )
        const secondOutboundPackageLineItem = lineItems.find(
          a => a.name === secondOutboundPackageLineItemName
        )
        const thirdOutboundPackageLineItemName = createProcessingObjectKey(
          thirdReservation.reservationNumber,
          "OutboundPackage"
        )
        const thirdOutboundPackageLineItem = lineItems.find(
          a => a.name === thirdOutboundPackageLineItemName
        )

        expect(firstOutboundPackageLineItem).toBeDefined()
        expect(firstOutboundPackageLineItem.price).toBe(0)
        expect(secondOutboundPackageLineItem).toBeDefined()
        expect(secondOutboundPackageLineItem.price).toBe(0)
        expect(thirdOutboundPackageLineItem).toBeDefined()
        expect(thirdOutboundPackageLineItem.price).toBe(0)
      })

      it("If a customer's second outbound package includes items from multiple reservations placed in the same day, only charge him for one outbound package", async () => {
        const firstReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(firstReservation.id, 25)
        await setReservationStatusWithParams(firstReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          firstReservation.sentPackage.id,
          23
        )
        await setPackageEnteredSystemAtWithParams(
          firstReservation.sentPackage.id,
          25
        )

        const secondReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(secondReservation.id, 15)
        await setReservationStatusWithParams(secondReservation.id, "Completed")

        const thirdReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(thirdReservation.id, 15)
        await setReservationStatusWithParams(thirdReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          thirdReservation.sentPackage.id,
          13
        )
        await setPackageEnteredSystemAtWithParams(
          thirdReservation.sentPackage.id,
          15
        )

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const firstOutboundPackageLineItemName = createProcessingObjectKey(
          firstReservation.reservationNumber,
          "OutboundPackage"
        )
        const firstOutboundPackageLineItem = lineItems.find(
          a => a.name === firstOutboundPackageLineItemName
        )
        const secondOutboundPackageLineItemName = createProcessingObjectKey(
          secondReservation.reservationNumber,
          "OutboundPackage"
        )
        const secondOutboundPackageLineItem = lineItems.find(
          a => a.name === secondOutboundPackageLineItemName
        )
        const thirdOutboundPackageLineItemName = createProcessingObjectKey(
          thirdReservation.reservationNumber,
          "OutboundPackage"
        )
        const thirdOutboundPackageLineItem = lineItems.find(
          a => a.name === thirdOutboundPackageLineItemName
        )

        expect(firstOutboundPackageLineItem).toBeDefined()
        expect(firstOutboundPackageLineItem.price).toBe(0)
        expect(secondOutboundPackageLineItem).toBeDefined()
        expect(secondOutboundPackageLineItem.price).toBe(0)
        expect(thirdOutboundPackageLineItem).toBeDefined()
        expect(thirdOutboundPackageLineItem.price).toBe(700) // 1000 with 30% discount
      })

      it("If a customer has more than one shipped outbound package in this billing cycle, charge him for all but the first", async () => {
        const firstReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(firstReservation.id, 25)
        await setReservationStatusWithParams(firstReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          firstReservation.sentPackage.id,
          23
        )
        await setPackageEnteredSystemAtWithParams(
          firstReservation.sentPackage.id,
          25
        )

        const secondReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(secondReservation.id, 15)
        await setReservationStatusWithParams(secondReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          secondReservation.sentPackage.id,
          13
        )
        await setPackageEnteredSystemAtWithParams(
          secondReservation.sentPackage.id,
          15
        )

        const thirdReservation = await addToBagAndReserveForCustomerWithParams(
          2,
          {
            shippingCode: "UPSGround",
          }
        )
        await setReservationCreatedAtWithParams(thirdReservation.id, 5)
        await setReservationStatusWithParams(thirdReservation.id, "Delivered")
        await setPackageDeliveredAtWithParams(
          thirdReservation.sentPackage.id,
          3
        )
        await setPackageEnteredSystemAtWithParams(
          thirdReservation.sentPackage.id,
          5
        )

        const custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const firstOutboundPackageLineItemName = createProcessingObjectKey(
          firstReservation.reservationNumber,
          "OutboundPackage"
        )
        const firstOutboundPackageLineItem = lineItems.find(
          a => a.name === firstOutboundPackageLineItemName
        )
        const secondOutboundPackageLineItemName = createProcessingObjectKey(
          secondReservation.reservationNumber,
          "OutboundPackage"
        )
        const secondOutboundPackageLineItem = lineItems.find(
          a => a.name === secondOutboundPackageLineItemName
        )
        const thirdOutboundPackageLineItemName = createProcessingObjectKey(
          thirdReservation.reservationNumber,
          "OutboundPackage"
        )
        const thirdOutboundPackageLineItem = lineItems.find(
          a => a.name === thirdOutboundPackageLineItemName
        )

        expect(firstOutboundPackageLineItem).toBeDefined()
        expect(firstOutboundPackageLineItem.price).toBe(0)
        expect(secondOutboundPackageLineItem).toBeDefined()
        expect(secondOutboundPackageLineItem.price).toBe(700) // 1000 with 30% discount
        expect(thirdOutboundPackageLineItem).toBeDefined()
        expect(thirdOutboundPackageLineItem.price).toBe(700) // 1000 with 30% discount
      })
    })

    describe("A reservation was created in the previous billing cycle but the outbound package was not sent until this billing cycle", () => {
      let transitionRentalInvoices
      let addLineItemsToFirstInvoice: (
        datas: Prisma.RentalInvoiceLineItemCreateWithoutRentalInvoiceInput[]
      ) => Promise<void>

      beforeAll(() => {
        transitionRentalInvoices = async () => {
          await prisma.client.customer.update({
            where: { id: testCustomer.id },
            data: {
              membership: {
                update: {
                  rentalInvoices: {
                    create: {
                      billingEndAt: timeUtils.xDaysAgoISOString(0),
                      billingStartAt: timeUtils.xDaysAgoISOString(30),
                    },
                    update: {
                      where: {
                        id: testCustomer.membership.rentalInvoices[0].id,
                      },
                      data: {
                        status: "Billed",
                      },
                    },
                  },
                },
              },
            },
          })
        }
        addLineItemsToFirstInvoice = async (
          datas: Prisma.RentalInvoiceLineItemCreateWithoutRentalInvoiceInput[]
        ) => {
          await prisma.client.customer.update({
            where: { id: testCustomer.id },
            data: {
              membership: {
                update: {
                  rentalInvoices: {
                    update: {
                      where: {
                        id: testCustomer.membership.rentalInvoices[0].id,
                      },
                      data: {
                        lineItems: {
                          create: datas,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        }
      })

      beforeEach(async () => {
        const { customer } = await testUtils.createTestCustomer({
          select: {
            id: true,
            membership: {
              select: {
                rentalInvoices: {
                  select: {
                    id: true,
                    billingEndAt: true,
                    billingStartAt: true,
                  },
                },
              },
            },
          },
          create: {
            membership: {
              create: {
                rentalInvoices: {
                  create: {
                    billingStartAt: timeUtils.xDaysAgoISOString(60),
                    billingEndAt: timeUtils.xDaysAgoISOString(30),
                  },
                },
              },
            },
          } as any,
        })
        testCustomer = customer
      })

      describe("It was charged last cycle", () => {
        it("The package was the second shipped outbound package from the previous billing cycle. Do not create line item or charge.", async () => {
          const firstReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(firstReservation.id, 45)
          await setReservationStatusWithParams(firstReservation.id, "Completed")
          await setPackageEnteredSystemAtWithParams(
            firstReservation.sentPackage.id,
            45
          )
          await setPackageDeliveredAtWithParams(
            firstReservation.sentPackage.id,
            43
          )
          await setPackageCreatedAtWithParams(
            firstReservation.sentPackage.id,
            45
          )

          const secondReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(secondReservation.id, 31)
          await setReservationStatusWithParams(
            secondReservation.id,
            "Completed"
          )
          await setPackageDeliveredAtWithParams(
            secondReservation.sentPackage.id,
            27
          )
          await setPackageEnteredSystemAtWithParams(
            secondReservation.sentPackage.id,
            29
          )
          await setPackageCreatedAtWithParams(
            secondReservation.sentPackage.id,
            31
          )

          await transitionRentalInvoices()
          await addLineItemsToFirstInvoice([
            {
              name: createProcessingObjectKey(
                firstReservation.reservationNumber,
                "OutboundPackage"
              ),
              price: 0,
              comment: "",
              currencyCode: "USD",
            },
            {
              name: createProcessingObjectKey(
                secondReservation.reservationNumber,
                "OutboundPackage"
              ),
              price: 700,
              comment: "",
              currencyCode: "USD",
            },
          ])

          const thirdReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(thirdReservation.id, 15)
          await setReservationStatusWithParams(thirdReservation.id, "Delivered")
          await setPackageDeliveredAtWithParams(
            thirdReservation.sentPackage.id,
            13
          )
          await setPackageEnteredSystemAtWithParams(
            thirdReservation.sentPackage.id,
            15
          )

          const custWithData = (await getCustWithDataWithParams()) as any
          const rentalInvoice = custWithData.membership.rentalInvoices[1]
          const lineItems = await rentalService.createRentalInvoiceLineItems(
            rentalInvoice
          )

          const secondOutboundPackageLineItemName = createProcessingObjectKey(
            secondReservation.reservationNumber,
            "OutboundPackage"
          )
          const secondOutboundPackageLineItem = lineItems.find(
            a => a.name === secondOutboundPackageLineItemName
          )

          expect(secondOutboundPackageLineItem).toBeUndefined()
        })
      })
      describe("It was not charged last cycle", () => {
        it("The package was the first shipped outbound package from the previous billing cycle. It was select. Charge", async () => {
          const firstReservation = await addToBagAndReserveForCustomerWithParams(
            2,
            {
              shippingCode: "UPSSelect",
            }
          )
          await setReservationCreatedAtWithParams(firstReservation.id, 31)
          await setReservationStatusWithParams(firstReservation.id, "Completed")
          await setPackageEnteredSystemAtWithParams(
            firstReservation.sentPackage.id,
            29
          )
          await setPackageDeliveredAtWithParams(
            firstReservation.sentPackage.id,
            27
          )
          await setPackageCreatedAtWithParams(
            firstReservation.sentPackage.id,
            31
          )
          await transitionRentalInvoices()
          await addLineItemsToFirstInvoice([
            {
              name: createProcessingObjectKey(
                firstReservation.reservationNumber,
                "OutboundPackage"
              ),
              price: 0,
              comment: "",
              currencyCode: "USD",
            },
          ])

          const secondReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(secondReservation.id, 21)
          await setReservationStatusWithParams(
            secondReservation.id,
            "Delivered"
          )
          await setPackageDeliveredAtWithParams(
            secondReservation.sentPackage.id,
            19
          )
          await setPackageEnteredSystemAtWithParams(
            secondReservation.sentPackage.id,
            21
          )

          const custWithData = (await getCustWithDataWithParams(
            Prisma.validator<Prisma.CustomerSelect>()({
              membership: {
                select: {
                  rentalInvoices: { orderBy: { billingStartAt: "asc" } },
                },
              },
            })
          )) as any
          const rentalInvoice = custWithData.membership.rentalInvoices[1]
          const lineItems = await rentalService.createRentalInvoiceLineItems(
            rentalInvoice
          )

          const firstOutboundPackageLineItemName = createProcessingObjectKey(
            firstReservation.reservationNumber,
            "OutboundPackage"
          )
          const firstOutboundPackageLineItem = lineItems.find(
            a => a.name === firstOutboundPackageLineItemName
          )

          expect(firstOutboundPackageLineItem).toBeDefined()
          expect(firstOutboundPackageLineItem.price).toBe(900) // 2000 with 55% discount
          expect(firstOutboundPackageLineItem.comment).toBe(
            "Outbound package created in previous billing cycle but did not enter delivery system until this billing cycle. Premium Package. Charge."
          )
        })

        it("The package was the first shipped outbound package from the previous billing cycle. It was ground. Do not charge", async () => {
          const firstReservation = await addToBagAndReserveForCustomerWithParams(
            2,
            {
              shippingCode: "UPSGround",
            }
          )
          await setReservationCreatedAtWithParams(firstReservation.id, 31)
          await setReservationStatusWithParams(firstReservation.id, "Completed")
          await setPackageEnteredSystemAtWithParams(
            firstReservation.sentPackage.id,
            29
          )
          await setPackageDeliveredAtWithParams(
            firstReservation.sentPackage.id,
            27
          )
          await setPackageCreatedAtWithParams(
            firstReservation.sentPackage.id,
            31
          )

          await transitionRentalInvoices()
          await addLineItemsToFirstInvoice([
            {
              name: createProcessingObjectKey(
                firstReservation.reservationNumber,
                "OutboundPackage"
              ),
              price: 0,
              comment: "",
              currencyCode: "USD",
            },
          ])

          const secondReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(secondReservation.id, 21)
          await setReservationStatusWithParams(
            secondReservation.id,
            "Delivered"
          )
          await setPackageDeliveredAtWithParams(
            secondReservation.sentPackage.id,
            19
          )
          await setPackageEnteredSystemAtWithParams(
            secondReservation.sentPackage.id,
            21
          )

          const custWithData = (await getCustWithDataWithParams()) as any
          const rentalInvoice = custWithData.membership.rentalInvoices[1]
          const lineItems = await rentalService.createRentalInvoiceLineItems(
            rentalInvoice
          )

          const firstOutboundPackageLineItemName = createProcessingObjectKey(
            firstReservation.reservationNumber,
            "OutboundPackage"
          )
          const firstOutboundPackageLineItem = lineItems.find(
            a => a.name === firstOutboundPackageLineItemName
          )

          expect(firstOutboundPackageLineItem).toBeDefined()
          expect(firstOutboundPackageLineItem.price).toBe(0)
          expect(firstOutboundPackageLineItem.comment).toBe(
            "Outbound package created in previous billing cycle but did not enter delivery system until this billing cycle. Not Premium Package. First package of previous billing cycle. Do not charge."
          )
        })

        it("The package was the second shipped outbound package from the previous billing cycle. Charge.", async () => {
          const firstReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(firstReservation.id, 45)
          await setReservationStatusWithParams(firstReservation.id, "Completed")
          await setPackageEnteredSystemAtWithParams(
            firstReservation.sentPackage.id,
            45
          )
          await setPackageDeliveredAtWithParams(
            firstReservation.sentPackage.id,
            43
          )
          await setPackageCreatedAtWithParams(
            firstReservation.sentPackage.id,
            45
          )

          const secondReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(secondReservation.id, 31)
          await setReservationStatusWithParams(
            secondReservation.id,
            "Completed"
          )
          await setPackageDeliveredAtWithParams(
            secondReservation.sentPackage.id,
            27
          )
          await setPackageEnteredSystemAtWithParams(
            secondReservation.sentPackage.id,
            29
          )
          await setPackageCreatedAtWithParams(
            secondReservation.sentPackage.id,
            31
          )

          await transitionRentalInvoices()
          await addLineItemsToFirstInvoice([
            {
              name: createProcessingObjectKey(
                firstReservation.reservationNumber,
                "OutboundPackage"
              ),
              price: 0,
              comment: "",
              currencyCode: "USD",
            },
            {
              name: createProcessingObjectKey(
                secondReservation.reservationNumber,
                "OutboundPackage"
              ),
              price: 0,
              comment: "",
              currencyCode: "USD",
            },
          ])

          const thirdReservation = await addToBagAndReserveForCustomerWithParams(
            2
          )
          await setReservationCreatedAtWithParams(thirdReservation.id, 15)
          await setReservationStatusWithParams(thirdReservation.id, "Delivered")
          await setPackageDeliveredAtWithParams(
            thirdReservation.sentPackage.id,
            13
          )
          await setPackageEnteredSystemAtWithParams(
            thirdReservation.sentPackage.id,
            15
          )

          const custWithData = (await getCustWithDataWithParams()) as any
          const rentalInvoice = custWithData.membership.rentalInvoices[1]
          const lineItems = await rentalService.createRentalInvoiceLineItems(
            rentalInvoice
          )

          const secondOutboundPackageLineItemName = createProcessingObjectKey(
            secondReservation.reservationNumber,
            "OutboundPackage"
          )
          const secondOutboundPackageLineItem = lineItems.find(
            a => a.name === secondOutboundPackageLineItemName
          )

          expect(secondOutboundPackageLineItem).toBeDefined()
          expect(secondOutboundPackageLineItem.price).toBe(700) // 1000 with a 30% discount
          expect(secondOutboundPackageLineItem.comment).toBe(
            "Outbound package created in previous billing cycle but did not enter delivery system until this billing cycle. Not Premium Package. Charge."
          )
        })
      })
    })
  })
})
