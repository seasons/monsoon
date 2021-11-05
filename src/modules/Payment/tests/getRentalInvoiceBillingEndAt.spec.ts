import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import moment from "moment"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"
import {
  expectTimeToEqual,
  getCustWithData,
  setCustomerSubscriptionNextBillingAt,
  setCustomerSubscriptionStatus,
} from "./utils/utils"

describe("Get Rental Invoice Billing End At", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let testCustomer: any
  let rentalInvoiceBillingEndAt: Date
  let custWithData
  let now
  let februarySeventh2021
  let marchSeventh2021
  const unitTestMocks = []

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)

    const { customer } = await testUtils.createTestCustomer({
      select: { id: true },
    })
    testCustomer = customer

    custWithData = (await getCustWithData(testCustomer, {
      prisma,
      select: {
        membership: {
          select: {
            id: true,
            subscription: {
              select: { subscriptionId: true, nextBillingAt: true },
            },
          },
        },
      },
    })) as any

    now = new Date()
    februarySeventh2021 = new Date(2021, 1, 7)
    marchSeventh2021 = new Date(2021, 2, 7)
  })

  afterEach(() => {
    unitTestMocks.forEach(mock => mock.mockRestore())
  })

  it("If the customer's subscription is set to cancel, returns 30 days from billingStartAt", async () => {
    await setCustomerSubscriptionStatus(testCustomer, "non_renewing", {
      prisma,
    })

    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )
    expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    await setCustomerSubscriptionStatus(testCustomer, "active", { prisma })
  })

  it("If nextBillingAt is undefined, returns 30 days from billingStartAt", async () => {
    await setCustomerSubscriptionNextBillingAt(testCustomer, null, { prisma })
    const mock = jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue({
        request: () => ({
          customer: {},
          subscription: {
            next_billing_at: undefined,
          },
        }),
      })
    unitTestMocks.push(mock)

    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )
    expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
  })

  it("If nextBillingAt is 40 days from now, returns 30 days from billingStartAt", async () => {
    await setCustomerSubscriptionNextBillingAt(
      testCustomer,
      timeUtils.xDaysFromNowISOString(40),
      { prisma }
    )

    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )
    expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
  })

  it("If the DB nextBillingAt is undefined, it queries chargebee", async () => {
    await setCustomerSubscriptionNextBillingAt(testCustomer, null, { prisma })

    const mock = jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue({
        request: () => ({
          customer: {},
          subscription: {
            // TODO: Replace with luxon
            next_billing_at: moment().subtract(100, "days").unix(),
          },
        }),
      })
    unitTestMocks.push(mock)

    custWithData = (await getCustWithData(testCustomer, {
      prisma,
      select: {
        membership: {
          select: {
            id: true,
            subscription: {
              select: { subscriptionId: true, nextBillingAt: true },
            },
          },
        },
      },
    })) as any
    const nextBillingAt = await rentalService.getSanitizedCustomerNextBillingAt(
      custWithData
    )
    expectTimeToEqual(nextBillingAt, new Date(timeUtils.xDaysAgoISOString(100)))
  })

  it("If the DB nextBillingAt is before now, it queries Chargebee", async () => {
    await setCustomerSubscriptionNextBillingAt(
      testCustomer,
      timeUtils.xDaysAgoISOString(1),
      { prisma }
    )

    const mock = jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue({
        request: () => ({
          customer: {},
          subscription: {
            // TODO: Replace with luxon
            next_billing_at: moment().subtract(100, "days").unix(),
          },
        }),
      })
    unitTestMocks.push(mock)

    custWithData = await getCustWithData(testCustomer, {
      prisma,
      select: {
        membership: {
          select: {
            id: true,
            subscription: {
              select: { subscriptionId: true, nextBillingAt: true },
            },
          },
        },
      },
    })
    const nextBillingAt = await rentalService.getSanitizedCustomerNextBillingAt(
      custWithData
    )
    expectTimeToEqual(nextBillingAt, new Date(timeUtils.xDaysAgoISOString(100)))
  })

  it("If querying Chargebee throws an error, returns 30 days from billingStartAt", async () => {
    await setCustomerSubscriptionNextBillingAt(testCustomer, null, { prisma })

    const mock = jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue({
        request: () => {
          throw "Subscription Retrieve Test Error"
        },
      })
    unitTestMocks.push(mock)
    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )

    expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
  })

  it("If nextBillingAt is before today, returns 30 days from billingStartAt", async () => {
    await setCustomerSubscriptionNextBillingAt(
      testCustomer,
      timeUtils.xDaysAgoISOString(1),
      { prisma }
    )

    const mock = jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue({
        request: () => ({
          customer: {},
          subscription: {
            next_billing_at: moment().subtract(1, "days").unix(),
          },
        }),
      })
    unitTestMocks.push(mock)

    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )
    expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
  })

  it("If nextBillingAt is tomorrow, returns nextBillingAt + 30 - 1", async () => {
    const tomorrow = new Date(timeUtils.xDaysFromNowISOString(1))
    await setCustomerSubscriptionNextBillingAt(testCustomer, tomorrow, {
      prisma,
    })
    const expectedValue = await rentalService.calculateBillingEndDateFromStartDate(
      tomorrow
    )

    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )
    expectTimeToEqual(rentalInvoiceBillingEndAt, expectedValue)
  })

  it("If nextBillingAt is 14 days from now, returns nextBillingAt - 1", async () => {
    const fourteenDaysFromNow = new Date(timeUtils.xDaysFromNowISOString(14))
    const thirteenDaysFromNow = new Date(timeUtils.xDaysFromNowISOString(13))
    await setCustomerSubscriptionNextBillingAt(
      testCustomer,
      fourteenDaysFromNow,
      { prisma }
    )

    rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
      custWithData.membership.id,
      februarySeventh2021
    )
    expectTimeToEqual(rentalInvoiceBillingEndAt, thirteenDaysFromNow)
  })

  describe("CalculateBillingEndDateFromStartDate", () => {
    it("If the next month has the start date's date, it uses that", async () => {
      rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        februarySeventh2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    })

    it("If the start date is the 31st and the next month only has 30 days, it uses 30", async () => {
      const marchThirtyFirst2021 = new Date(2021, 2, 31)
      rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        marchThirtyFirst2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 3, 30))
    })

    it("If the start date is 30 and the next month is February in a non leap year, it uses the 28th", async () => {
      const januaryThirty2021 = new Date(2021, 0, 30)
      rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        januaryThirty2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 1, 28))
    })

    it("If the start date is 30 and the next month is February in a leap year, it uses the 29th", async () => {
      const januaryThirty2024 = new Date(2024, 0, 30)
      rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        januaryThirty2024
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2024, 1, 29))
    })

    it("If the start date is 29 and the next month is February in a leap year, it uses the 29th", async () => {
      const januaryTwentyNine2024 = new Date(2024, 0, 29)
      rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        januaryTwentyNine2024
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2024, 1, 29))
    })

    it("If the start date is in december, it creates the billing end at date in the following year", async () => {
      const decemberThirtyOne2021 = new Date(2021, 11, 31)
      rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        decemberThirtyOne2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2022, 0, 31))
    })
  })
})
