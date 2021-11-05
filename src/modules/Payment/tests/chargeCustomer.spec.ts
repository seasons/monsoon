import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import moment from "moment"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../services/rental.service"
import {
  addToBagAndReserveForCustomer,
  createLineItemHash,
  createProcessingObjectKey,
  getCustWithData,
  overridePrices,
  setCustomerPlanType,
  setCustomerSubscriptionNextBillingAt,
  setCustomerSubscriptionStatus,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "./utils/utils"
import { Prisma } from ".prisma/client"

const CHARGEBEE_USAGE_LINE_ITEMS = [
  {
    amount: 2300,
    date_from: 1628741509,
    date_to: 1630642309,
    tax_amount: 184,
    tax_rate: 0.08,
    description: "Some production description 1",
    is_taxed: true,
  },
  {
    amount: 3841,
    date_from: 1628741509,
    date_to: 1630642309,
    tax_amount: 307,
    tax_rate: 0.08,
    description: "Some product description 2",
    is_taxed: true,
  },
  {
    amount: 550,
    date_from: 1628741509,
    date_to: 1630642309,
    tax_amount: 44,
    tax_rate: 0.08,
    description: "Processing description",
    is_taxed: true,
  },
]
const CHARGEBEE_INVOICE_CREATE_MOCK = {
  request: () => ({
    invoice: {
      id: "17025",
      customer_id: "ckt3y8o150000zzuv7d7iuesr",
      recurring: false,
      status: "paid",
      total: 6632,
      amount_paid: 6632,
      tax: 491,
      line_items: CHARGEBEE_USAGE_LINE_ITEMS,
    },
  }),
}

const CHARGEBEE_SUBSCRIPTION_ADD_CHARGE_AT_TERM_END_MOCK = {
  request: async () => ({
    estimate: {
      invoice_estimate: {
        line_items: [
          ...CHARGEBEE_USAGE_LINE_ITEMS,
          {
            amount: 2500,
            date_from: 1628741509,
            date_to: 1630642309,
            tax_rate: 0.08,
            tax_amount: 0,
            description: "access-monthly",
            tax_exempt_reason: "export",
            is_taxed: true,
          },
        ],
      },
    },
  }),
}

const CHARGEBEE_SUBSCRIPTION_ADD_CHARGE_AT_TERM_END_ERROR_MOCK = {
  request: async () => {
    throw "Subscription Charge at term end error"
  },
}

const CHARGEBEE_DELETE_UNBILLED_CHARGE_MOCK = {
  request: async () => ({
    unbilled_charge: {
      amount: 100,
      currency_code: "USD",
      customer_id: "__test__8aszcSOcqxML5l",
      date_from: 1517495906,
      date_to: 1519915106,
      deleted: false,
      description: "Day Pass USD Monthly",
      discount_amount: 0,
      entity_id: "day-pass-USD",
      entity_type: "addon_item_price",
      id: "li___test__8aszcSOcqxX05r",
      is_voided: false,
      object: "unbilled_charge",
      pricing_model: "flat_fee",
      quantity: 1,
      subscription_id: "__test__8aszcSOcqxTF5o",
      unit_amount: 100,
    },
  }),
}

const CHARGEBEE_UNBILLED_CHARGES_LIST_MOCK = {
  request: async () => ({
    list: [
      {
        unbilled_charge: {
          amount: 100,
          currency_code: "USD",
          customer_id: "__test__8aszcSOcqy1i6F",
          date_from: 1517495909,
          date_to: 1519915109,
          deleted: false,
          description: "Day Pass USD Monthly",
          discount_amount: 0,
          entity_id: "day-pass-USD",
          entity_type: "addon_item_price",
          id: "li___test__8aszcSOcqyBc6L",
          is_voided: false,
          object: "unbilled_charge",
          pricing_model: "flat_fee",
          quantity: 1,
          subscription_id: "__test__8aszcSOcqy6V6I",
          unit_amount: 100,
        },
      },
      {
        unbilled_charge: {
          amount: 100,
          currency_code: "USD",
          customer_id: "__test__8aszcSOcqy1iasdfasdf",
          date_from: 1517495909,
          date_to: 1519915109,
          deleted: false,
          description: "Day Pass USD Monthly",
          discount_amount: 0,
          entity_id: "day-pass-USD",
          entity_type: "addon_item_price",
          id: "li___test__8aszcSOcqyBc6L",
          is_voided: false,
          object: "unbilled_charge",
          pricing_model: "flat_fee",
          quantity: 1,
          subscription_id: "__test__8aszcSOcqy6V6I",
          unit_amount: 100,
        },
      },
    ],
  }),
}

const CHARGEBEE_SUBSCRIPTION_RETRIEVE_MOCK = {
  request: async () => ({
    customer: {},
    subscription: {
      // TODO: Use luxon
      next_billing_at: moment().add(5, "days").unix(),
    },
  }),
}
describe("Charge customer", () => {
  let timeUtils: TimeUtilsService
  let reservationService: ReservationService
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService

  let rentalInvoiceToBeBilled
  let billedRentalInvoice
  let customerRentalInvoicesAfterBilling
  let lineItems
  let initialReservationProductSUIDs

  let testCustomer

  let addToBagAndReserveForCustomerWithParams
  let setReservationCreatedAtWithParams
  let setPackageDeliveredAtWithParams
  let setReservationStatusWithParams
  let getCustWithDataWithParams
  let setCustomerPlanTypeWithParams
  let setCustomerSubscriptionNextBillingAtWithParams
  let setPackageEnteredSystemAtWithParams

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)

    addToBagAndReserveForCustomerWithParams = numBagItems =>
      addToBagAndReserveForCustomer(testCustomer, numBagItems, {
        prisma,
        reservationService,
      })
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
    setPackageEnteredSystemAtWithParams = (packageId, numDaysAgo) =>
      setPackageEnteredSystemAt(packageId, numDaysAgo, { prisma, timeUtils })
    setReservationStatusWithParams = (reservationId, status) =>
      setReservationStatus(reservationId, status, { prisma })
    setCustomerPlanTypeWithParams = planType =>
      setCustomerPlanType(testCustomer, planType, { prisma })
    setCustomerSubscriptionNextBillingAtWithParams = nextBillingAt =>
      setCustomerSubscriptionNextBillingAt(testCustomer, nextBillingAt, {
        prisma,
      })

    jest
      .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
      .mockReturnValue(CHARGEBEE_SUBSCRIPTION_ADD_CHARGE_AT_TERM_END_MOCK)
    jest
      .spyOn<any, any>(chargebee.invoice, "create")
      .mockReturnValue(CHARGEBEE_INVOICE_CREATE_MOCK)
    jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue(CHARGEBEE_SUBSCRIPTION_RETRIEVE_MOCK)
    jest
      .spyOn<any, any>(chargebee.unbilled_charge, "list")
      .mockReturnValue(CHARGEBEE_UNBILLED_CHARGES_LIST_MOCK)

    jest
      .spyOn<any, any>(chargebee.unbilled_charge, "delete")
      .mockReturnValue(CHARGEBEE_DELETE_UNBILLED_CHARGE_MOCK)
  })

  describe("Properly charges an access-monthly customer", () => {
    let addedCharges = []
    let lineItemsWithDataAfterCharging
    let lineItemsBySUIDOrName
    let expectedResultsBySUIDOrName

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer

      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
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

      const custWithData = await getCustWithDataWithParams()

      initialReservationProductSUIDs = initialReservation.products.map(
        a => a.seasonsUID
      )
      await overridePrices(initialReservationProductSUIDs, [30, 50], { prisma })
      rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      })

      await setCustomerPlanTypeWithParams("access-monthly")
      ;({
        lineItems,
        charges: addedCharges,
      } = await rentalService.processInvoice(rentalInvoiceToBeBilled))
      billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
        where: { id: rentalInvoiceToBeBilled.id },
        select: { id: true, status: true },
      })

      const custWithUpdatedData = await getCustWithDataWithParams({
        membership: {
          select: {
            rentalInvoices: {
              select: { status: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      })
      customerRentalInvoicesAfterBilling =
        custWithUpdatedData.membership.rentalInvoices

      lineItemsWithDataAfterCharging = await prisma.client.rentalInvoiceLineItem.findMany(
        {
          where: { id: { in: lineItems.map(a => a.id) } },
          select: {
            taxPrice: true,
            taxRate: true,
            physicalProduct: { select: { seasonsUID: true } },
            name: true,
          },
        }
      )

      lineItemsBySUIDOrName = createLineItemHash(lineItemsWithDataAfterCharging)
      expectedResultsBySUIDOrName = {
        [initialReservationProductSUIDs[0]]: {
          taxPrice: 184,
          taxRate: 0.08,
        },
        [initialReservationProductSUIDs[1]]: {
          taxPrice: 307,
          taxRate: 0.08,
        },
      }
    })

    it("Creates a charge for each line item", () => {
      expect(addedCharges.length).toBe(2)
    })

    it("Marks their current rental invoice as billed", () => {
      expect(billedRentalInvoice.status).toBe("Billed")
    })

    it("Initializes their next rental invoice", () => {
      expect(customerRentalInvoicesAfterBilling.length).toBe(2)
      expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
      expect(customerRentalInvoicesAfterBilling[1].status).toBe("Billed")
    })

    it("Adds taxes to the line items", () => {
      expect(Object.keys(expectedResultsBySUIDOrName).length).toBe(2)
      for (const id of Object.keys(expectedResultsBySUIDOrName)) {
        expect(lineItemsBySUIDOrName[id].taxPrice).toEqual(
          expectedResultsBySUIDOrName[id].taxPrice
        )
        expect(lineItemsBySUIDOrName[id].taxRate).toEqual(
          expectedResultsBySUIDOrName[id].taxRate
        )
      }
    })
  })

  describe("Properly charges an access-annual customer", () => {
    let addedCharges
    let lineItemsWithDataAfterCharging
    let lineItemsBySUIDOrName
    let expectedResultsBySUIDOrName

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer

      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
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

      // Override product prices so we can predict the proper price
      const custWithData = (await getCustWithDataWithParams()) as any

      initialReservationProductSUIDs = initialReservation.products.map(
        a => a.seasonsUID
      )
      await overridePrices(initialReservationProductSUIDs, [30, 50], { prisma })
      await setCustomerPlanTypeWithParams("access-yearly")
      await setCustomerSubscriptionNextBillingAtWithParams(
        timeUtils.xDaysFromNowISOString(100)
      )
      rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      })
      ;({
        lineItems,
        charges: addedCharges,
      } = await rentalService.processInvoice(rentalInvoiceToBeBilled))

      billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
        where: { id: rentalInvoiceToBeBilled.id },
        select: { id: true, status: true },
      })

      const custWithUpdatedData = (await getCustWithDataWithParams({
        membership: {
          select: {
            rentalInvoices: {
              select: { status: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      })) as any
      customerRentalInvoicesAfterBilling =
        custWithUpdatedData.membership.rentalInvoices

      lineItemsWithDataAfterCharging = await prisma.client.rentalInvoiceLineItem.findMany(
        {
          where: { id: { in: lineItems.map(a => a.id) } },
          select: {
            taxPrice: true,
            taxRate: true,
            physicalProduct: { select: { seasonsUID: true } },
            name: true,
          },
        }
      )

      lineItemsBySUIDOrName = createLineItemHash(lineItemsWithDataAfterCharging)
      expectedResultsBySUIDOrName = {
        [initialReservationProductSUIDs[0]]: {
          taxPrice: 184,
          taxRate: 0.08,
        },
        [initialReservationProductSUIDs[1]]: {
          taxPrice: 307,
          taxRate: 0.08,
        },
      }
    })

    it("Creates a single chargebee invoice for the whole RentalInvoice", () => {
      expect(addedCharges.length).toBe(1)
    })

    it("Marks their current rental invoice as billed", () => {
      expect(billedRentalInvoice.status).toBe("Billed")
    })

    it("Initializes their next rental invoice", () => {
      expect(customerRentalInvoicesAfterBilling.length).toBe(2)
      expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
      expect(customerRentalInvoicesAfterBilling[1].status).toBe("Billed")
    })

    it("Adds taxes to the line items", () => {
      expect(Object.keys(expectedResultsBySUIDOrName).length).toBe(2)
      for (const id of Object.keys(expectedResultsBySUIDOrName)) {
        expect(lineItemsBySUIDOrName[id].taxPrice).toEqual(
          expectedResultsBySUIDOrName[id].taxPrice
        )
        expect(lineItemsBySUIDOrName[id].taxRate).toEqual(
          expectedResultsBySUIDOrName[id].taxRate
        )
      }
    })
  })

  describe("Properly handles an error from chargebee", () => {
    beforeAll(async () => {
      const spy = jest
        .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
        .mockReturnValue(
          CHARGEBEE_SUBSCRIPTION_ADD_CHARGE_AT_TERM_END_ERROR_MOCK
        )

      const { customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer

      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")

      const custWithData = (await getCustWithDataWithParams()) as any

      rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      })

      await setCustomerPlanTypeWithParams("access-monthly")
      ;({ lineItems } = await rentalService.processInvoice(
        rentalInvoiceToBeBilled
      ))

      billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
        where: { id: rentalInvoiceToBeBilled.id },
        select: { id: true, status: true },
      })

      const custWithUpdatedData = (await getCustWithDataWithParams({
        membership: {
          select: {
            rentalInvoices: {
              select: { status: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      })) as any
      customerRentalInvoicesAfterBilling =
        custWithUpdatedData.membership.rentalInvoices

      // Revert back to non-error mock function so other tests work
      jest
        .spyOn<any, any>(chargebee.subscription, "retrieve")
        .mockReturnValue(CHARGEBEE_SUBSCRIPTION_RETRIEVE_MOCK)
    })

    it("Marks the current rental invoice as ChargeFailed", () => {
      expect(billedRentalInvoice.status).toBe("ChargeFailed")
    })

    it("Initializes their next rental invoice", () => {
      expect(customerRentalInvoicesAfterBilling.length).toBe(2)
      expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
      expect(customerRentalInvoicesAfterBilling[1].status).toBe("ChargeFailed")
    })
  })

  describe("Properly handles an error when creating line items", () => {
    beforeAll(async () => {
      const spy = jest
        .spyOn<any, any>(rentalService, "createRentalInvoiceLineItems")
        .mockImplementation(() => {
          throw "Create Rental Invoice Line Items Test Error"
        })

      const { cleanupFunc, customer } = await testUtils.createTestCustomer({
        select: { id: true },
      })
      testCustomer = customer

      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        23
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")

      const custWithData = (await getCustWithDataWithParams()) as any

      rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      })

      await setCustomerPlanTypeWithParams("access-monthly")
      ;({ lineItems } = await rentalService.processInvoice(
        rentalInvoiceToBeBilled
      ))

      billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
        where: { id: rentalInvoiceToBeBilled.id },
        select: { id: true, status: true },
      })

      const custWithUpdatedData = (await getCustWithDataWithParams({
        membership: {
          select: {
            rentalInvoices: {
              select: { status: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      })) as any
      customerRentalInvoicesAfterBilling =
        custWithUpdatedData.membership.rentalInvoices

      spy.mockRestore()
    })

    it("Marks the current rental invoice as ChargeFailed", () => {
      expect(billedRentalInvoice.status).toBe("ChargeFailed")
    })

    it("Initializes their next rental invoice", () => {
      expect(customerRentalInvoicesAfterBilling.length).toBe(2)
      expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
      expect(customerRentalInvoicesAfterBilling[1].status).toBe("ChargeFailed")
    })
  })

  it("Charges them immediately if their subscription is set to cancelled", async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: { id: true },
    })
    testCustomer = customer
    await setCustomerSubscriptionStatus(testCustomer, "cancelled", { prisma })

    const initialReservation = await addToBagAndReserveForCustomerWithParams(2)
    await setReservationCreatedAtWithParams(initialReservation.id, 25)
    await setPackageDeliveredAtWithParams(initialReservation.sentPackage.id, 23)
    await setReservationStatusWithParams(initialReservation.id, "Delivered")

    const custWithData = (await getCustWithDataWithParams()) as any
    const rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique(
      {
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      }
    )

    const {
      lineItems,
      charges: addedCharges,
    } = await rentalService.processInvoice(rentalInvoiceToBeBilled)

    expect(addedCharges.length).toBe(1)
  })

  it("Charges them immediately if their subscription is set to non_renewing", async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: { id: true },
    })
    testCustomer = customer
    await setCustomerSubscriptionStatus(testCustomer, "non_renewing", {
      prisma,
    })
    const initialReservation = await addToBagAndReserveForCustomerWithParams(2)
    await setReservationCreatedAtWithParams(initialReservation.id, 25)
    await setPackageDeliveredAtWithParams(initialReservation.sentPackage.id, 23)
    await setReservationStatusWithParams(initialReservation.id, "Delivered")

    const custWithData = (await getCustWithDataWithParams()) as any

    const rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique(
      {
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      }
    )

    const {
      lineItems,
      charges: addedCharges,
    } = await rentalService.processInvoice(rentalInvoiceToBeBilled)

    expect(addedCharges.length).toBe(1)
  })

  it("Charges them immediately if their subscription nextBillingAt is more than 2 days from now", async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: { id: true },
    })
    testCustomer = customer
    await setCustomerSubscriptionNextBillingAtWithParams(
      timeUtils.xDaysFromNowISOString(3)
    )
    const initialReservation = await addToBagAndReserveForCustomerWithParams(2)
    await setReservationCreatedAtWithParams(initialReservation.id, 25)
    await setPackageDeliveredAtWithParams(initialReservation.sentPackage.id, 23)
    await setReservationStatusWithParams(initialReservation.id, "Delivered")

    const custWithData = (await getCustWithDataWithParams()) as any

    const rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique(
      {
        where: { id: custWithData.membership.rentalInvoices[0].id },
        select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
      }
    )

    const {
      lineItems,
      charges: addedCharges,
    } = await rentalService.processInvoice(rentalInvoiceToBeBilled)

    expect(addedCharges.length).toBe(1)
  })

  describe("Properly handles retries of invoices with status ChargeFailed", () => {
    let custWithData
    let rentalInvoicesStatuses
    let lineItems

    describe("Line items were successfully created the first time through", () => {
      beforeAll(async () => {
        const { customer } = await testUtils.createTestCustomer({
          select: { id: true },
        })
        testCustomer = customer
        await setCustomerSubscriptionNextBillingAtWithParams(
          timeUtils.xDaysFromNowISOString(20)
        )

        jest.spyOn<any, any>(chargebee.invoice, "create").mockReturnValue({
          request: () => {
            throw "Invoice Create test error"
          },
        })

        // Invoice 1. Should end up with ChargeFailed
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2
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

        custWithData = (await getCustWithDataWithParams()) as any
        expect(custWithData.membership.rentalInvoices.length).toBe(1)
        let rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique(
          {
            where: { id: custWithData.membership.rentalInvoices[0].id },
            select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
          }
        )
        await rentalService.processInvoice(rentalInvoiceToBeBilled)
        lineItems = await prisma.client.rentalInvoiceLineItem.findMany({
          where: { rentalInvoice: { id: rentalInvoiceToBeBilled.id } },
        })
        custWithData = (await getCustWithDataWithParams()) as any
        rentalInvoicesStatuses = custWithData.membership.rentalInvoices.map(
          a => a.status
        )

        expect(custWithData.membership.rentalInvoices.length).toBe(2)
        expect(rentalInvoicesStatuses.includes("ChargeFailed")).toBe(true)
        expect(rentalInvoicesStatuses.includes("Draft")).toBe(true)
        expect(lineItems.length).toBe(3) // two item charges, one outbound package charge

        // Next charge. No error being thrown this time
        jest
          .spyOn<any, any>(chargebee.invoice, "create")
          .mockReturnValue(CHARGEBEE_INVOICE_CREATE_MOCK)
        const rentalInvoiceToBeBilledID = custWithData.membership.rentalInvoices.find(
          a => a.status === "ChargeFailed"
        ).id
        rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
          where: { id: rentalInvoiceToBeBilledID },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        })
        await rentalService.processInvoice(rentalInvoiceToBeBilled, {
          onError: err => console.log(err),
        })

        custWithData = (await getCustWithDataWithParams()) as any
        rentalInvoicesStatuses = custWithData.membership.rentalInvoices.map(
          a => a.status
        )
        lineItems = await prisma.client.rentalInvoiceLineItem.findMany({
          where: { rentalInvoice: { id: rentalInvoiceToBeBilled.id } },
          select: { id: true },
        })
      })

      it("Doesn't create another rental invoice during retry", () => {
        expect(custWithData.membership.rentalInvoices.length).toBe(2)
        expect(rentalInvoicesStatuses.includes("Billed")).toBe(true)
        expect(rentalInvoicesStatuses.includes("Draft")).toBe(true)
      })

      it("Doesn't re-create line items if they already exist on a rental invoice", () => {
        // two for item charges
        expect(lineItems.length).toBe(3)
      })
    })

    describe("Line items were not successfully created the first time through", () => {
      beforeAll(async () => {
        const { customer } = await testUtils.createTestCustomer({
          select: { id: true },
        })
        testCustomer = customer
        await setCustomerSubscriptionNextBillingAtWithParams(
          timeUtils.xDaysFromNowISOString(20)
        )

        const spy = jest
          .spyOn<any, any>(rentalService, "createRentalInvoiceLineItems")
          .mockImplementation(() => {
            throw "Create Rental Invoice Line Items Test Error"
          })

        // Invoice 1. Should end up with ChargeFailed
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2
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

        custWithData = (await getCustWithDataWithParams()) as any
        expect(custWithData.membership.rentalInvoices.length).toBe(1)
        let rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique(
          {
            where: { id: custWithData.membership.rentalInvoices[0].id },
            select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
          }
        )
        await rentalService.processInvoice(rentalInvoiceToBeBilled)
        lineItems = await prisma.client.rentalInvoiceLineItem.findMany({
          where: { rentalInvoice: { id: rentalInvoiceToBeBilled.id } },
        })
        custWithData = (await getCustWithDataWithParams()) as any
        rentalInvoicesStatuses = custWithData.membership.rentalInvoices.map(
          a => a.status
        )

        expect(custWithData.membership.rentalInvoices.length).toBe(2)
        expect(rentalInvoicesStatuses.includes("ChargeFailed")).toBe(true)
        expect(rentalInvoicesStatuses.includes("Draft")).toBe(true)
        expect(lineItems.length).toBe(0) // failure during line item creation

        // Next charge. No error being thrown this time
        spy.mockRestore()
        const rentalInvoiceToBeBilledID = custWithData.membership.rentalInvoices.find(
          a => a.status === "ChargeFailed"
        ).id
        rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
          where: { id: rentalInvoiceToBeBilledID },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        })
        await rentalService.processInvoice(rentalInvoiceToBeBilled)

        custWithData = (await getCustWithDataWithParams()) as any
        rentalInvoicesStatuses = custWithData.membership.rentalInvoices.map(
          a => a.status
        )
        lineItems = await prisma.client.rentalInvoiceLineItem.findMany({
          where: { rentalInvoice: { id: rentalInvoiceToBeBilled.id } },
          select: { id: true },
        })
      })

      it("Creates the line items the second time through", () => {
        expect(lineItems.length).toBe(3) // two items, one outbound package
      })

      it("Doesn't create another rental invoice during retry", () => {
        expect(custWithData.membership.rentalInvoices.length).toBe(2)
        expect(rentalInvoicesStatuses.includes("Billed")).toBe(true)
        expect(rentalInvoicesStatuses.includes("Draft")).toBe(true)
      })
    })

    describe("Deletes pending charges before retrying an invoice", () => {
      let deleteUnbilledChargesSpy
      let chargebeeDeleteUnbilledChargeSpy

      beforeAll(async () => {
        jest
          .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
          .mockReturnValue(
            CHARGEBEE_SUBSCRIPTION_ADD_CHARGE_AT_TERM_END_ERROR_MOCK
          )

        const { customer } = await testUtils.createTestCustomer({
          select: { id: true },
        })
        testCustomer = customer
        await setCustomerSubscriptionNextBillingAtWithParams(
          timeUtils.xDaysFromNowISOString(1)
        )
        deleteUnbilledChargesSpy = jest.spyOn(
          rentalService,
          "deleteUnbilledCharges"
        )
        chargebeeDeleteUnbilledChargeSpy = jest.spyOn(
          chargebee.unbilled_charge,
          "delete"
        )
        deleteUnbilledChargesSpy.mockClear()
        chargebeeDeleteUnbilledChargeSpy.mockClear()

        // Invoice 1. Should end up with ChargeFailed
        const initialReservation = await addToBagAndReserveForCustomerWithParams(
          2
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

        custWithData = (await getCustWithDataWithParams()) as any
        let rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique(
          {
            where: { id: custWithData.membership.rentalInvoices[0].id },
            select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
          }
        )
        await rentalService.processInvoice(rentalInvoiceToBeBilled, {
          onError: err => console.log(err),
        })

        // Next charge. No error being thrown this time
        jest
          .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
          .mockReturnValue(CHARGEBEE_SUBSCRIPTION_ADD_CHARGE_AT_TERM_END_MOCK)
        custWithData = (await getCustWithDataWithParams()) as any
        const rentalInvoiceToBeBilledID = custWithData.membership.rentalInvoices.find(
          a => a.status === "ChargeFailed"
        ).id
        rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
          where: { id: rentalInvoiceToBeBilledID },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        })
        await rentalService.processInvoice(rentalInvoiceToBeBilled, {
          onError: err => console.log(err),
        })
      })

      it("Deletes unbilled charges on chargebee", () => {
        expect(deleteUnbilledChargesSpy).toHaveBeenCalledTimes(2) // once on initial failure, one on retry
        expect(chargebeeDeleteUnbilledChargeSpy).toHaveBeenCalledTimes(4) // twice on initial failure, and twice on retry
      })
    })
  })
})
