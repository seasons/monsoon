import { SMSService } from "@app/modules/SMS/services/sms.service"
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
    jest.spyOn(SMSService.prototype as any, "setupService").mockImplementation()
    const moduleRef = await Test.createTestingModule(PaymentModuleDef).compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    const utilsService = moduleRef.get<UtilsService>(UtilsService)
    testUtils = new TestUtilsService(prisma, utilsService)
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
        process.env.REFERRAL_COUPON_ID
      )

      const newCustomer = await prisma.binding.query.customer(
        { where: { id: customer.id } },
        `{
          id
          billingInfo {
            id
            brand
            name
            last_digits
            expiration_month
            expiration_year
            street1
            city
            state
            country
            postal_code
          }
          status
          user {
            id
          }
          membership {
            subscriptionId
            plan {
              planID
            }
          }
        }`
      )

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
      const emailReceipts = await prisma.client.emailReceipts({
        where: {
          user: { id: newCustomer.user.id },
        },
      })
      expect(emailReceipts.length).toEqual(1)
      expect(emailReceipts[0].emailId).toEqual("WelcomeToSeasons")

      await prisma.client.deleteBillingInfo({ id: newCustomer.billingInfo.id })
      await prisma.client.deleteManyEmailReceipts({
        user: { id: newCustomer.user.id },
      })
      await prisma.client.deleteManyPaymentPlans({})
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
  const request = await chargebee.plan.list().request()
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
