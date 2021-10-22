import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { getPaymentSucceededEvent } from "./data/chargebee"
import { Customer } from ".prisma/client"

describe("Chargebee Controller", () => {
  let testCustomer: any
  let app: INestApplication
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let server

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      PAYMENT_MODULE_DEF
    ).compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)

    app = moduleRef.createNestApplication()
    await app.init()
  })

  beforeEach(async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: { id: true, membership: { select: { creditBalance: true } } },
    })
    testCustomer = customer
  })

  afterAll(async () => {
    app.close()
  })

  describe("Grandfathered credits", () => {
    it("If a grandfathered customer pays an invoice without any membership dues, we do not add credits to their account", () => {
      expect(0).toBe(1)
    })
    it("If a grandfathered customer pays membership dues for a traditional plan, we add credits to their account", () => {
      expect(0).toBe(1)
    })

    it("If a grandfathered customer pays membership dues for an access plan, we do not add credits to their account", async () => {
      const paymentSucceededEvent = getPaymentSucceededEvent(testCustomer.id)
      expect(testCustomer.membership.creditBalance).toBe(0)

      await request(app.getHttpServer())
        .post("/chargebee_events")
        .send(paymentSucceededEvent)

      const customerWithData = await prisma.client.customer.findUnique({
        where: { id: testCustomer.id },
        select: { membership: { select: { creditBalance: true } } },
      })
      expect(customerWithData.membership.creditBalance).toBe(0)
    })

    it("If a non-grandfathered customer pays membership dues for a traditional plan, we do not add credits to their account", () => {
      expect(0).toBe(1)
    })

    it("If a non-grandfathered customer pays membership dues for an access plan, we do not add credits to their account", () => {
      expect(0).toBe(1)
    })
  })

  describe("Miscellaneous credits created on chargebee", () => {
    it("Adds the credits internally and deducts them from Chargebee", () => {
      expect(0).toBe(1)
    })
  })
})
