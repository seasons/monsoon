import { SMSService } from "@app/modules/SMS/services/sms.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"

import { PaymentModuleDef } from "../payment.module"
import { PaymentService } from "../services/payment.service"

enum ChargebeeMockFunction {
  CustomerCreate,
  PaymentSourceCreateUsingTempToken,
  SubscriptionCreateForCustomer,
}

class ChargeeBeeMock {
  constructor(private readonly mockFunction: ChargebeeMockFunction) {}

  async request() {
    switch (this.mockFunction) {
      case ChargebeeMockFunction.CustomerCreate:
        return { customer: { id: "test" } }
      case ChargebeeMockFunction.PaymentSourceCreateUsingTempToken:
        return {
          payment_source: {
            card: {
              card_type: "american_express",
              first_name: "Test",
              last_name: "User",
              last4: "0005",
              expiry_month: 12,
              expiry_year: 2022,
            },
          },
        }
      case ChargebeeMockFunction.SubscriptionCreateForCustomer:
        return {
          subscription: {
            id: "testId",
            next_billing_at: 1615137136,
            current_term_end: 1615137136,
            current_term_start: 1612717936,
            status: "Active",
            plan_amount: 9500,
            plan_id: "essential",
          },
          customer: {
            billing_address: {
              line1: "138 Mulberry St",
              line2: "",
              city: "New York",
              state: "NY",
              country: "USA",
              zip: "10013",
            },
          },
        }
    }
  }
}

describe("Payment Service", () => {
  let prisma: PrismaService
  let paymentService: PaymentService
  let testUtils: TestUtilsService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(PaymentModuleDef).compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    const utilsService = moduleRef.get<UtilsService>(UtilsService)
    const queryUtilsService = moduleRef.get<QueryUtilsService>(
      QueryUtilsService
    )
    testUtils = new TestUtilsService(prisma, utilsService, queryUtilsService)
    paymentService = moduleRef.get<PaymentService>(PaymentService)
  })

  describe("ApplePay Checkout", () => {
    it("Successfully updates customer details", async () => {
      await setupPaymentPlans()
      const planID = "essential"
      const token = {
        tokenId: "test",
        card: {
          addressLine1: "138 Mulberry St",
          addressLine2: "",
          addressCity: "New York",
          addressState: "NY",
          addressZip: "10013",
          addressCountry: "USA",
        },
      }
      const shippingAddress = {
        address1: "1600 Pennsylvania Ave",
        address2: "",
        city: "Washington",
        state: "DC",
        zipCode: "20500",
      }
      const { customer, cleanupFunc } = await testUtils.createTestCustomer({
        email: "test@seasons.nyc",
      })
      jest
        .spyOn<any, any>(chargebee.customer, "create")
        .mockReturnValue(
          new ChargeeBeeMock(ChargebeeMockFunction.CustomerCreate)
        )
      jest
        .spyOn<any, any>(chargebee.payment_source, "create_using_temp_token")
        .mockReturnValue(
          new ChargeeBeeMock(
            ChargebeeMockFunction.PaymentSourceCreateUsingTempToken
          )
        )
      jest
        .spyOn<any, any>(chargebee.subscription, "create_for_customer")
        .mockReturnValue(
          new ChargeeBeeMock(
            ChargebeeMockFunction.SubscriptionCreateForCustomer
          )
        )

      await paymentService.stripeTokenCheckout(
        planID,
        token,
        customer,
        "apple_pay",
        process.env.REFERRAL_COUPON_ID,
        "flare",
        shippingAddress
      )

      const _newCustomer = await prisma.client2.customer.findUnique({
        where: { id: customer.id },
        select: {
          id: true,
          billingInfo: {
            select: {
              id: true,
              brand: true,
              name: true,
              last_digits: true,
              expiration_month: true,
              expiration_year: true,
              street1: true,
              city: true,
              state: true,
              country: true,
              postal_code: true,
            },
          },
          status: true,
          user: { select: { id: true } },
          membership: {
            select: {
              id: true,
              subscriptionId: true,
              subscription: { select: { id: true } },
              plan: { select: { id: true, planID: true } },
            },
          },
        },
      })
      const newCustomer = prisma.sanitizePayload(_newCustomer, "Customer")

      // Confirm Billing Info fields
      expect(newCustomer.billingInfo.brand).toEqual("american_express")
      expect(newCustomer.billingInfo.name).toEqual("Test User")
      expect(newCustomer.billingInfo.last_digits).toEqual("0005")
      expect(newCustomer.billingInfo.expiration_month).toEqual(12)
      expect(newCustomer.billingInfo.expiration_year).toEqual(2022)
      expect(newCustomer.billingInfo.street1).toEqual("138 Mulberry St")
      expect(newCustomer.billingInfo.city).toEqual("New York")
      expect(newCustomer.billingInfo.state).toEqual("NY")
      expect(newCustomer.billingInfo.country).toEqual("USA")
      expect(newCustomer.billingInfo.postal_code).toEqual("10013")

      // Status is Active
      expect(newCustomer.status).toEqual("Active")

      // Membership plan is linked
      expect(newCustomer.membership.subscriptionId).toEqual("testId")
      expect(newCustomer.membership.plan.planID).toEqual("essential")

      // Email was sent
      const emailReceipts = await prisma.client2.emailReceipt.findMany({
        where: {
          user: { id: newCustomer.user.id },
        },
      })
      expect(emailReceipts.length).toEqual(1)
      expect(emailReceipts[0].emailId).toEqual("WelcomeToSeasons")

      await prisma.client2.billingInfo.delete({
        where: { id: newCustomer.billingInfo.id },
      })
      await prisma.client2.emailReceipt.deleteMany({
        where: { user: { id: newCustomer.user.id } },
      })
      await prisma.client2.paymentPlan.deleteMany({})
      cleanupFunc()
    })
  })
})

const setupPaymentPlans = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })
  const ps = new PrismaService()
  const request = await chargebee.plan.list({ limit: 100 }).request()
  const list = request?.list || []

  list.forEach(async item => {
    if (item?.plan?.id) {
      const data = {
        planID: item.plan.id,
        name: item.plan.name,
        price: item.plan.price,
        status: item.plan.status,
      }

      await ps.client.upsertPaymentPlan({
        where: { planID: item.plan.id },
        create: data,
        update: data,
      })
    }
  })
}
