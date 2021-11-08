import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import request from "supertest"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { getPromotionalCreditsAddedEvent } from "./data/creditsAdded"
import { getPaymentSucceededEvent } from "./data/paymentSucceeded"
import { getSubscriptionCancelledEvent } from "./data/subscriptionCancelled"

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

  describe("Subscription Cancelled Handler", () => {
    let chargebeeDeductCreditsSpy
    let customerAfterWebhook

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
          user: { select: { id: true } },
          membership: { select: { creditBalance: true } },
        },
      })
      testCustomer = customer
      const custAfterUpdate = await prisma.client.customer.update({
        where: { id: testCustomer.id },
        data: { membership: { update: { creditBalance: 3000 } } },
        select: { membership: { select: { creditBalance: true } } },
      })
      expect(custAfterUpdate.membership.creditBalance).toBe(3000)

      chargebeeDeductCreditsSpy = jest
        .spyOn<any, any>(chargebee.promotional_credit, "deduct")
        .mockReturnValue({
          request: () => null,
        })

      const event = getSubscriptionCancelledEvent(testCustomer.user.id, 45.67)
      await sendEvent(event)

      customerAfterWebhook = await prisma.client.customer.findUnique({
        where: { id: testCustomer.id },
        select: {
          status: true,
          membership: {
            select: {
              creditBalance: true,
              creditUpdateHistory: {
                select: { id: true, reason: true, amount: true },
              },
            },
          },
        },
      })
    })

    // Don't want test customers created before each one here
    // Send payload for customer.
    it("Customer is marked as Deactivated", () => {
      expect(customerAfterWebhook.status).toBe("Deactivated")
    })

    it("Internal credit balance is set to 0", () => {
      expect(customerAfterWebhook.membership.creditBalance).toBe(0)
    })

    it("Credit balance update log created", () => {
      const log = customerAfterWebhook.membership.creditUpdateHistory.find(
        a => a.reason === "Customer cancelled. Remove outstanding credits"
      )
      expect(log).toBeDefined()
      expect(log.amount).toBe(3000)
    })

    it("Chargebee credit balance is set to 0", () => {
      expect(chargebeeDeductCreditsSpy).toBeCalledTimes(1)
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
      membership: {
        select: {
          creditBalance: true,
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
