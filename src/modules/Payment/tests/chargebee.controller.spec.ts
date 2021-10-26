import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import request from "supertest"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { getPromotionalCreditsAddedEvent } from "./data/creditsAdded"
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

  afterAll(async () => {
    app.close()
  })

  describe("Grandfathered credits", () => {
    beforeEach(async () => {
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
            "Grandfathered customer paid subscription dues on Essential 1 plan"
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
            "Grandfathered customer paid subscription dues on Essential 2 plan"
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
            "Grandfathered customer paid subscription dues on Essential plan"
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
            "Grandfathered customer paid subscription dues on Essential 6 plan"
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
            "Grandfathered customer paid subscription dues on All Access 1 plan"
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
            "Grandfathered customer paid subscription dues on All Access 2 plan"
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
            "Grandfathered customer paid subscription dues on All Access plan"
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
    it("Adds the credits internally and deducts them from Chargebee", async () => {
      const chargebeeDeductCreditsSpy = jest
        .spyOn<any, any>(chargebee.promotional_credit, "deduct")
        .mockReturnValue({
          request: () => null,
        })

      expect(testCustomer.membership.creditBalance).toBe(0)

      const event = getPromotionalCreditsAddedEvent(testCustomer.user.id, 1700)
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