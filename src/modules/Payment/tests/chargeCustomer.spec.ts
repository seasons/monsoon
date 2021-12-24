import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import cuid from "cuid"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"

describe("Charge Customer", () => {
  let timeUtils: TimeUtilsService
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService

  let mocksToRestore = []

  afterEach(() => {
    mocksToRestore.forEach(mock => mock.mockRestore())
    mocksToRestore = []
  })
  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
  })

  describe("Edge Cases", () => {
    test("If there are no line items, handles it properly", async () => {
      const invoiceCreateMock = jest.spyOn(chargebee.invoice, "create")
      const subscriptionAddChargeAtTermEndMock = jest.spyOn(
        chargebee.subscription,
        "add_charge_at_term_end"
      )
      mocksToRestore.push(invoiceCreateMock)
      mocksToRestore.push(subscriptionAddChargeAtTermEndMock)

      const {
        promises,
        chargebeeRecords,
        resultType,
      } = await rentalService.chargebeeChargeTab([])

      expect(promises).toHaveLength(0)
      expect(chargebeeRecords).toHaveLength(0)
      expect(resultType).toBe("NoCharges")
      expect(invoiceCreateMock).not.toHaveBeenCalled()
      expect(subscriptionAddChargeAtTermEndMock).not.toHaveBeenCalled()
    })

    test("If there are line items but the sum total is 0, handles it properly", async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          membership: { select: { rentalInvoices: { select: { id: true } } } },
        },
      })
      await prisma.client.rentalInvoiceLineItem.createMany({
        data: [
          {
            price: 0,
            currencyCode: "USD",
            rentalInvoiceId: customer.membership.rentalInvoices[0].id,
            type: "Package",
          },
          {
            price: 0,
            currencyCode: "USD",
            rentalInvoiceId: customer.membership.rentalInvoices[0].id,
            type: "Package",
          },
          {
            price: 0,
            currencyCode: "USD",
            rentalInvoiceId: customer.membership.rentalInvoices[0].id,
            type: "Package",
          },
        ],
      })
      const lineItems = await prisma.client.rentalInvoiceLineItem.findMany({
        where: { rentalInvoiceId: customer.membership.rentalInvoices[0].id },
        select: { id: true },
      })
      const lineItemIds = lineItems.map(lineItem => ({ id: lineItem.id }))
      const invoiceCreateMock = jest.spyOn(chargebee.invoice, "create")
      const subscriptionAddChargeAtTermEndMock = jest.spyOn(
        chargebee.subscription,
        "add_charge_at_term_end"
      )
      mocksToRestore.push(invoiceCreateMock)
      mocksToRestore.push(subscriptionAddChargeAtTermEndMock)

      const {
        promises,
        chargebeeRecords,
        resultType,
      } = await rentalService.chargebeeChargeTab(lineItemIds)

      expect(promises).toHaveLength(0)
      expect(chargebeeRecords).toHaveLength(0)
      expect(resultType).toBe("NoCharges")
      expect(invoiceCreateMock).not.toHaveBeenCalled()
      expect(subscriptionAddChargeAtTermEndMock).not.toHaveBeenCalled()
    })
  })

  describe("Main cases", () => {
    let lineItemIds
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          membership: { select: { rentalInvoices: { select: { id: true } } } },
        },
      })
      const physicalProducts = await prisma.client.physicalProduct.findMany({
        take: 3,
        select: { id: true },
      })
      await prisma.client.rentalInvoiceLineItem.createMany({
        data: [
          {
            price: 100,
            currencyCode: "USD",
            rentalInvoiceId: customer.membership.rentalInvoices[0].id,
            physicalProductId: physicalProducts[0].id,
            type: "PhysicalProduct",
          },
          {
            price: 200,
            currencyCode: "USD",
            rentalInvoiceId: customer.membership.rentalInvoices[0].id,
            physicalProductId: physicalProducts[1].id,
            type: "PhysicalProduct",
          },
          {
            price: 300,
            currencyCode: "USD",
            rentalInvoiceId: customer.membership.rentalInvoices[0].id,
            physicalProductId: physicalProducts[2].id,
            type: "PhysicalProduct",
          },
        ],
      })

      const lineItems = await prisma.client.rentalInvoiceLineItem.findMany({
        where: { rentalInvoiceId: customer.membership.rentalInvoices[0].id },
        select: { id: true },
      })
      lineItemIds = lineItems.map(lineItem => ({ id: lineItem.id }))
    })
    test("If shouldChargeImmediately is true, Handles it properly", async () => {
      /*
      Charges immediately
      Adds taxes
      Creates a local copy of the chargebee invoice
      connects

      */
      const shouldChargeImmediatelyMock = jest
        .spyOn(rentalService, "shouldChargeImmediately")
        .mockImplementation(() => true)
      mocksToRestore.push(shouldChargeImmediatelyMock)

      const chargebeeInvoiceId = cuid()
      const invoiceCreateMock = jest
        .spyOn(chargebee.invoice, "create")
        .mockImplementation(({ customer_id, currency_code, charges }) => {
          return {
            request: () => {
              return {
                invoice: {
                  id: chargebeeInvoiceId,
                  status: "paid",
                  total: 600,
                  line_items: charges.map(charge => ({
                    amount: charge.amount,
                    tax_amount: charge.amount * 0.08,
                    tax_rate: 0.08,
                  })),
                },
              }
            },
          }
        })
      mocksToRestore.push(invoiceCreateMock)
      const {
        promises,
        chargebeeRecords,
        resultType,
      } = await rentalService.chargebeeChargeTab(lineItemIds)

      expect(promises).toHaveLength(4)
      expect(chargebeeRecords).toHaveLength(1)
      expect(chargebeeRecords[0].invoice).toBeDefined()
      expect(invoiceCreateMock).toHaveBeenCalled()
      expect(resultType).toBe("ChargedNow")

      await prisma.client.$transaction(promises)

      const lineItemsAfter = await prisma.client.rentalInvoiceLineItem.findMany(
        {
          where: { id: { in: lineItemIds.map(lineItem => lineItem.id) } },
          orderBy: { price: "asc" },
          select: { id: true, taxPrice: true, taxRate: true },
        }
      )

      expect(lineItemsAfter[0].taxPrice).toBe(8)
      expect(lineItemsAfter[1].taxPrice).toBe(16)
      expect(lineItemsAfter[2].taxPrice).toBe(24)
      expect(lineItemsAfter.every(a => a.taxRate === 0.08)).toBe(true)

      const createdChargebeeInvoiceRecord = await prisma.client.chargebeeInvoice.findUnique(
        { where: { chargebeeId: chargebeeInvoiceId } }
      )

      expect(createdChargebeeInvoiceRecord).toBeDefined()
      expect(createdChargebeeInvoiceRecord.subtotal).toBe(600)
      expect(createdChargebeeInvoiceRecord.status).toBe("Paid")
    })

    test("If shouldChargeImmediately is false, handles it properly", async () => {
      /*
      Adds pending charges
      Adds taxes
      Does not create a chargebee invoice (No way to test this)
      Result Type is proper
      */

      const shouldChargeImmediatelyMock = jest
        .spyOn(rentalService, "shouldChargeImmediately")
        .mockImplementation(() => false)
      mocksToRestore.push(shouldChargeImmediatelyMock)

      const addChargeToTermEndMock = jest
        .spyOn(chargebee.subscription, "add_charge_at_term_end")
        .mockImplementation((subscriptionId, payload: any) => {
          return {
            request: () => {
              return {
                estimate: {
                  invoice_estimate: {
                    line_items: [
                      {
                        amount: payload.amount,
                        tax_amount: payload.amount * 0.08,
                        tax_rate: 0.08,
                      },
                    ],
                  },
                },
              }
            },
          }
        })
      mocksToRestore.push(addChargeToTermEndMock)

      const {
        promises,
        chargebeeRecords,
        resultType,
      } = await rentalService.chargebeeChargeTab(lineItemIds)

      expect(promises).toHaveLength(3)
      expect(chargebeeRecords).toHaveLength(3)
      expect(addChargeToTermEndMock).toHaveBeenCalled()
      expect(resultType).toBe("PendingCharges")

      await prisma.client.$transaction(promises)

      const lineItemsAfter = await prisma.client.rentalInvoiceLineItem.findMany(
        {
          where: { id: { in: lineItemIds.map(lineItem => lineItem.id) } },
          orderBy: { price: "asc" },
          select: { id: true, taxPrice: true, taxRate: true },
        }
      )

      expect(lineItemsAfter[0].taxPrice).toBe(8)
      expect(lineItemsAfter[1].taxPrice).toBe(16)
      expect(lineItemsAfter[2].taxPrice).toBe(24)
      expect(lineItemsAfter.every(a => a.taxRate === 0.08)).toBe(true)
    })
  })

  describe("Should charge immediately func", () => {
    test("If subscription status is non_renewing or cancelled, returns true", () => {
      const val = rentalService.shouldChargeImmediately(
        "non_renewing",
        timeUtils.xDaysFromNow(1),
        false
      )
      expect(val).toBe(true)

      const val2 = rentalService.shouldChargeImmediately(
        "cancelled",
        timeUtils.xDaysFromNow(1),
        false
      )
      expect(val2).toBe(true)
    })

    test("If next billing at is 3 days from now, returns true", () => {
      const val = rentalService.shouldChargeImmediately(
        "active",
        timeUtils.xDaysFromNow(3),
        false
      )
      expect(val).toBe(true)
    })

    test("If we override, returns true", () => {
      const val = rentalService.shouldChargeImmediately(
        "active",
        timeUtils.xDaysFromNow(1),
        true
      )
      expect(val).toBe(true)
    })

    test("For an active customer with nextBillingAt tomorrow, returns false", () => {
      const val = rentalService.shouldChargeImmediately(
        "active",
        timeUtils.xDaysFromNow(1),
        false
      )
      expect(val).toBe(false)
    })
  })
})
