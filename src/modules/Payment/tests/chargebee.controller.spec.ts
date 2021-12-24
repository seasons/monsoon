import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import request from "supertest"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { getPromotionalCreditsAddedEvent } from "./data/creditsAdded"
import { getInvoiceGeneratedEvent } from "./data/invoiceGenerated"
import { getPaymentSourceUpdatedEvent } from "./data/paymentSourceUpdated"
import { getPaymentSucceededEvent } from "./data/paymentSucceeded"

let testCustomer: any
let prisma: PrismaService

describe("Chargebee Controller", () => {
  let app: INestApplication
  let testUtils: TestUtilsService
  let testServer
  let customerWithData

  const sendEvent = async event => {
    await testServer.post("/chargebee_events").send(event)
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      PAYMENT_MODULE_DEF
    ).compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)

    app = moduleRef.createNestApplication()
    await app.init()
    testServer = request(app.getHttpServer())
  })

  afterAll(async () => {
    app.close()
  })

  describe("Add correct membership credits on payment succeeded", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
          user: { select: { id: true } },
          membership: { select: { id: true, purchaseCredits: true } },
        },
      })
      testCustomer = customer
      expect(testCustomer.membership.purchaseCredits).toBe(0)
    })

    it("while customer is on essential plan, does not add membership dicount credits", async () => {
      await prisma.client.customerMembership.update({
        where: { id: testCustomer.membership.id },
        data: { plan: { connect: { planID: "essential" } } },
      })

      const paymentSucceededEvent = getPaymentSucceededEvent(
        testCustomer.user.id,
        "essential"
      )

      await sendEvent(paymentSucceededEvent)

      customerWithData = await getCustWithData()
      expect(customerWithData.membership.purchaseCredits).toBe(0)
    })

    it("while customer is on access-yearly plan, customer has 3000 membership discount credits", async () => {
      await prisma.client.customerMembership.update({
        where: { id: testCustomer.membership.id },
        data: { plan: { connect: { planID: "access-yearly" } } },
      })

      const paymentSucceededEvent = getPaymentSucceededEvent(
        testCustomer.user.id,
        "access-yearly"
      )

      await sendEvent(paymentSucceededEvent)

      customerWithData = await getCustWithData()
      expect(customerWithData.membership.purchaseCredits).toBe(3000)
    })

    it("If on access-monthly plan, customer should have 2000 membership discount credits", async () => {
      await prisma.client.customerMembership.update({
        where: { id: testCustomer.membership.id },
        data: { plan: { connect: { planID: "access-monthly" } } },
      })

      const paymentSucceededEvent = getPaymentSucceededEvent(
        testCustomer.user.id,
        "access-monthly"
      )

      await sendEvent(paymentSucceededEvent)

      customerWithData = await getCustWithData()
      expect(customerWithData.membership.purchaseCredits).toBe(2000)
    })
  })

  describe("Grandfathered credits", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
          user: { select: { id: true } },
          membership: { select: { creditBalance: true } },
        },
      })
      testCustomer = customer
      expect(testCustomer.membership.creditBalance).toBe(0)
    })

    describe("Grandfathered customers", () => {
      beforeEach(async () => {
        await setGrandfatheredOnCustomer(true)
      })
      it("If a grandfathered customer pays an invoice without any membership dues, we do not add credits to their account", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "adhoc"
        )
        sendEvent(paymentSucceededEvent)

        customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(0)
      })

      describe("If a grandfathered customer pays membership dues for a traditional plan, we add credits to their account", () => {
        it("Essential 1", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "essential-1"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(7475)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(7475)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on Essential 1 plan. Invoice #7067"
          )
        })
        it("Essential 2", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "essential-2"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(10925)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(10925)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on Essential 2 plan. Invoice #7067"
          )
        })
        it("Essential", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "essential"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(14375)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(14375)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on Essential plan. Invoice #7067"
          )
        })
        it("Essential 6", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "essential-6"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(24725)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(24725)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on Essential 6 plan. Invoice #7067"
          )
        })
        it("All Access 1", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "all-access-1"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(12075)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(12075)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on All Access 1 plan. Invoice #7067"
          )
        })
        it("All Access 2", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "all-access-2"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(16675)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(16675)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on All Access 2 plan. Invoice #7067"
          )
        })
        it("All Access", async () => {
          const paymentSucceededEvent = getPaymentSucceededEvent(
            testCustomer.user.id,
            "all-access"
          )
          await sendEvent(paymentSucceededEvent)

          const customerWithData = await getCustWithData()
          expect(customerWithData.membership.creditBalance).toBe(20125)

          const latestCreditBalanceUpdateLog =
            customerWithData.membership.creditUpdateHistory?.[0]
          expect(latestCreditBalanceUpdateLog).toBeDefined()
          expect(latestCreditBalanceUpdateLog.amount).toBe(20125)
          expect(latestCreditBalanceUpdateLog.reason).toBe(
            "Grandfathered customer paid subscription dues on All Access plan. Invoice #7067"
          )
        })
      })

      it("If a grandfathered customer pays membership dues for an access-monthly plan, we do not add credits to their account", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "access-monthly"
        )

        await sendEvent(paymentSucceededEvent)
        customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(0)
      })

      it("If a grandfathered customer pays membership dues for an access-yearly plan, we do not add credits to their account", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "access-yearly"
        )

        await sendEvent(paymentSucceededEvent)
        customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(0)
      })

      it("If a grandfathered customer gets a discount on a traditional plan membership renewal fee, we reduce their promotional credits accodingly", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "essential",
          5500 // discount from 12500
        )
        await sendEvent(paymentSucceededEvent)
        customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(6325) // 5500 * 1.15
      })

      it("If a webhook fires twice, we add credits only once", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "essential-1"
        )
        await sendEvent(paymentSucceededEvent)
        await sendEvent(paymentSucceededEvent)

        const customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(7475)

        const latestCreditBalanceUpdateLog =
          customerWithData.membership.creditUpdateHistory?.[0]
        expect(latestCreditBalanceUpdateLog).toBeDefined()
        expect(latestCreditBalanceUpdateLog.amount).toBe(7475)
        expect(latestCreditBalanceUpdateLog.reason).toBe(
          "Grandfathered customer paid subscription dues on Essential 1 plan. Invoice #7067"
        )
      })
    })

    describe("Non grandfathered customers", () => {
      beforeEach(async () => {
        setGrandfatheredOnCustomer(false)
      })

      it("If a non-grandfathered customer pays membership dues for a traditional plan, we do not add credits to their account", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "essential"
        )

        await sendEvent(paymentSucceededEvent)

        customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(0)
      })

      it("If a non-grandfathered customer pays membership dues for an access plan, we do not add credits to their account", async () => {
        const paymentSucceededEvent = getPaymentSucceededEvent(
          testCustomer.user.id,
          "access-monthly"
        )

        await sendEvent(paymentSucceededEvent)
        customerWithData = await getCustWithData()
        expect(customerWithData.membership.creditBalance).toBe(0)
      })
    })
  })

  describe("Miscellaneous credits created on chargebee", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
          user: { select: { id: true } },
          membership: { select: { creditBalance: true } },
        },
      })
      testCustomer = customer
    })
    it("Adds the credits internally and deducts them from Chargebee", async () => {
      const chargebeeDeductCreditsSpy = jest
        .spyOn<any, any>(chargebee.promotional_credit, "deduct")
        .mockReturnValue({
          request: () => null,
        })

      expect(testCustomer.membership.creditBalance).toBe(0)

      const event = getPromotionalCreditsAddedEvent(
        testCustomer.user.id,
        1700,
        "Grandfathered essential credits"
      )
      await sendEvent(event)

      customerWithData = await getCustWithData()
      expect(customerWithData.membership.creditBalance).toBe(1700)
      expect(chargebeeDeductCreditsSpy).toHaveBeenCalledTimes(1)

      const latestCreditBalanceUpdateLog =
        customerWithData.membership.creditUpdateHistory?.[0]
      expect(latestCreditBalanceUpdateLog).toBeDefined()
      expect(latestCreditBalanceUpdateLog.amount).toBe(1700)
      expect(latestCreditBalanceUpdateLog.reason).toBe(
        "Automatic transfer of credits added on chargebee to internal system."
      )
      chargebeeDeductCreditsSpy.mockClear()
    })

    it("If the description includes (MONSOON_IGNORE), leaves them on Chargebee", async () => {
      const chargebeeDeductCreditsSpy = jest
        .spyOn<any, any>(chargebee.promotional_credit, "deduct")
        .mockReturnValue({
          request: () => null,
        })

      expect(testCustomer.membership.creditBalance).toBe(0)

      const event = getPromotionalCreditsAddedEvent(
        testCustomer.user.id,
        1700,
        "(MONSOON_IGNORE) Grandfathered credits applied towards rental charges"
      )
      await sendEvent(event)

      customerWithData = await getCustWithData()
      expect(customerWithData.membership.creditBalance).toBe(0)
      expect(chargebeeDeductCreditsSpy).toHaveBeenCalledTimes(0)

      const latestCreditBalanceUpdateLog =
        customerWithData.membership.creditUpdateHistory?.[0]
      expect(latestCreditBalanceUpdateLog).toBeUndefined()
    })
  })

  describe("Handles PaymentFailure actions correctly", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
          user: { select: { id: true } },
          membership: { select: { id: true, purchaseCredits: true } },
        },
      })
      testCustomer = customer
    })
    it("If a PaymentFailed customer updates their payment method, sets them to Active", async () => {
      await prisma.client.customer.update({
        where: { id: testCustomer.id },
        data: { status: "PaymentFailed" },
      })

      customerWithData = await getCustWithData()
      expect(customerWithData.status).toBe("PaymentFailed")

      const event = getPaymentSourceUpdatedEvent(testCustomer.user.id)
      await sendEvent(event)

      customerWithData = await getCustWithData()
      expect(customerWithData.status).toBe("Active")
    })
  })

  describe("Connects Chargebee Invoices to Rental Invoices appropriately", () => {
    beforeEach(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
          user: { select: { id: true } },
          membership: { select: { rentalInvoices: { select: { id: true } } } },
        },
      })
      testCustomer = customer
    })
    it("If a chargebee invoice is created for a ChargePending rental invoice, connects it appropriately", async () => {
      const rentalInvoice = testCustomer.membership.rentalInvoices[0]
      await prisma.client.rentalInvoice.update({
        where: { id: rentalInvoice.id },
        data: {
          status: "ChargePending",
          lineItems: {
            createMany: {
              data: [
                { price: 0, type: "PhysicalProduct", currencyCode: "USD" },
                { price: 100, type: "PhysicalProduct", currencyCode: "USD" },
                { price: 100, type: "Package", currencyCode: "USD" },
                { price: 200, type: "PhysicalProduct", currencyCode: "USD" },
                { price: 300, type: "PhysicalProduct", currencyCode: "USD" },
              ],
            },
          },
        },
      })
      const event = getInvoiceGeneratedEvent(testCustomer.user.id, [
        { amount: 100 },
        { amount: 100 },
        { amount: 200 },
        { amount: 300 },
      ])
      await sendEvent(event)

      const rentalInvoiceAfterEvent = await prisma.client.rentalInvoice.findUnique(
        {
          where: { id: rentalInvoice.id },
          select: {
            status: true,
            billedAt: true,
            chargebeeInvoice: {
              select: {
                chargebeeId: true,
                total: true,
                status: true,
                invoiceCreatedAt: true,
              },
            },
          },
        }
      )
      expect(rentalInvoiceAfterEvent.status).toBe("Billed")
      testUtils.expectTimeToEqual(rentalInvoiceAfterEvent.billedAt, new Date())
      expect(rentalInvoiceAfterEvent.chargebeeInvoice).toBeDefined()
      expect(rentalInvoiceAfterEvent.chargebeeInvoice.chargebeeId).toBeDefined()
      expect(rentalInvoiceAfterEvent.chargebeeInvoice.total).toBe(700)
      expect(rentalInvoiceAfterEvent.chargebeeInvoice.status).toBe("Paid")
      testUtils.expectTimeToEqual(
        rentalInvoiceAfterEvent.chargebeeInvoice.invoiceCreatedAt,
        new Date()
      )
    })

    it("If a chargebee invoice is created with line items that don't match the customer's ChargePending rental invoice, do nothing", async () => {
      const rentalInvoice = testCustomer.membership.rentalInvoices[0]
      await prisma.client.rentalInvoice.update({
        where: { id: rentalInvoice.id },
        data: {
          status: "ChargePending",
          lineItems: {
            createMany: {
              data: [
                { price: 100, type: "PhysicalProduct", currencyCode: "USD" },
                { price: 100, type: "Package", currencyCode: "USD" },
                { price: 200, type: "PhysicalProduct", currencyCode: "USD" },
                { price: 300, type: "PhysicalProduct", currencyCode: "USD" },
              ],
            },
          },
        },
      })
      const event = getInvoiceGeneratedEvent(testCustomer.user.id, [
        { amount: 100 },
        { amount: 100 },
        { amount: 200 },
      ])
      await sendEvent(event)

      const rentalInvoiceAfterEvent = await prisma.client.rentalInvoice.findUnique(
        {
          where: { id: rentalInvoice.id },
          select: {
            status: true,
            billedAt: true,
            chargebeeInvoice: {
              select: {
                chargebeeId: true,
                total: true,
                status: true,
                invoiceCreatedAt: true,
              },
            },
          },
        }
      )
      expect(rentalInvoiceAfterEvent.status).toBe("ChargePending")
      expect(rentalInvoiceAfterEvent.chargebeeInvoice).toBeNull()
    })
  })
})

const setGrandfatheredOnCustomer = async (grandfathered: boolean) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: { membership: { update: { grandfathered } } },
  })
}

const getCustWithData = async () => {
  return await prisma.client.customer.findUnique({
    where: { id: testCustomer.id },
    select: {
      status: true,
      membership: {
        select: {
          creditBalance: true,
          purchaseCredits: true,
          creditUpdateHistory: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { amount: true, reason: true },
          },
        },
      },
    },
  })
}
