import { TestUtilsService } from "@app/modules/Test/services/test.service"
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
  setCustomerPlanType,
  setCustomerSubscriptionNextBillingAt,
  setCustomerSubscriptionStatus,
} from "./utils/utils"

describe("Get Rental Invoice Billing End At", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let testCustomer: any
  let custWithData
  let now
  let februarySeventh2021
  let marchSeventh2021
  const unitTestMocks = []

  let setCustomerSubscriptionStatusWithParams
  let setCustomerSubscriptionNextBillingAtWithParams
  let setCustomerPlanTypeWithParams

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

    setCustomerSubscriptionStatusWithParams = async status =>
      setCustomerSubscriptionStatus(testCustomer, status, {
        prisma,
      })

    setCustomerSubscriptionNextBillingAtWithParams = async nextBillingAt =>
      setCustomerSubscriptionNextBillingAt(testCustomer, nextBillingAt, {
        prisma,
      })

    setCustomerPlanTypeWithParams = async planType =>
      setCustomerPlanType(testCustomer, planType, { prisma })
  })

  afterEach(async () => {
    unitTestMocks.forEach(mock => mock.mockRestore())
    await setCustomerSubscriptionStatusWithParams("active")
  })

  describe("Miscellaneous Edge cases", () => {
    it("If the customer's subscription is set to cancel, returns 30 days from billingStartAt", async () => {
      await setCustomerSubscriptionStatusWithParams("non_renewing")

      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        februarySeventh2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
      await setCustomerSubscriptionStatusWithParams("active")
    })

    it("If nextBillingAt is undefined, returns 30 days from billingStartAt", async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(null)
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

      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        februarySeventh2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    })

    it("If nextBillingAt is 40 days from now, returns 30 days from billingStartAt", async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(
        timeUtils.xDaysFromNowISOString(40)
      )

      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        februarySeventh2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    })

    it("If the DB nextBillingAt is undefined, it queries chargebee", async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(null)

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
      expectTimeToEqual(
        nextBillingAt,
        new Date(timeUtils.xDaysAgoISOString(100))
      )
    })

    it("If the DB nextBillingAt is before now, it queries Chargebee", async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(
        timeUtils.xDaysAgoISOString(1)
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
      expectTimeToEqual(
        nextBillingAt,
        new Date(timeUtils.xDaysAgoISOString(100))
      )
    })

    it("If querying Chargebee throws an error, returns 30 days from billingStartAt", async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(null)

      const mock = jest
        .spyOn<any, any>(chargebee.subscription, "retrieve")
        .mockReturnValue({
          request: () => {
            throw "Subscription Retrieve Test Error"
          },
        })
      unitTestMocks.push(mock)
      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        februarySeventh2021
      )

      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    })

    it("If nextBillingAt is before today, returns 30 days from billingStartAt", async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(
        timeUtils.xDaysAgoISOString(1)
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

      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        februarySeventh2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    })
  })

  describe("nextBillingAt is ~30 days from now (expected case)", () => {
    let oneDayAfterNextBillingAt
    let oneDayBeforeNextBillingAt
    let now
    beforeAll(async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(
        timeUtils.xDaysFromNowISOString(30)
      )
      oneDayBeforeNextBillingAt = timeUtils.xDaysFromNowISOString(29)
      oneDayAfterNextBillingAt = timeUtils.xDaysFromNowISOString(31)
      now = new Date()
    })
    it("Customer is access-monthly. Return 1 day before nextBillingAt", async () => {
      await setCustomerPlanTypeWithParams("access-monthly")
      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        now
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayBeforeNextBillingAt)
    })

    it("Customer is access-yearly. Return 1 day before nextBillingAt", async () => {
      await setCustomerPlanTypeWithParams("access-yearly")
      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        now
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayBeforeNextBillingAt)
    })

    describe("Customer is any other plan. Return 1 day after nextBillingAt", () => {
      it("Essential 1", async () => {
        await setCustomerPlanTypeWithParams("essential-1")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })
      it("Essential 2", async () => {
        await setCustomerPlanTypeWithParams("essential-2")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })
      it("Essential", async () => {
        await setCustomerPlanTypeWithParams("essential")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })

      it("Essential 6", async () => {
        await setCustomerPlanTypeWithParams("essential-6")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })
      it("All Access 1", async () => {
        await setCustomerPlanTypeWithParams("all-access-1")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })
      it("All Access 2", async () => {
        await setCustomerPlanTypeWithParams("all-access-2")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })
      it("All Access", async () => {
        await setCustomerPlanTypeWithParams("all-access")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          now
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, oneDayAfterNextBillingAt)
      })
    })
  })

  describe("nextBillingAt is 2 days from now (particular edge case)", () => {
    let oneDayAfterNextNextBillingAt = new Date(2030, 9, 1) // oct 1
    let oneDayBeforeNextNextBillingAt = new Date(2030, 8, 29) // sept 29
    let septemberThirtieth = new Date(2030, 8, 30)
    let isLessThanXDaysFromNowMock

    // use august 31st because "30" days from it will be september 30. This allows
    // us to test a very edgey case
    let augustThirtyFirst2021 = new Date(2030, 7, 31) // aug 31
    beforeAll(async () => {
      await setCustomerSubscriptionNextBillingAtWithParams(
        augustThirtyFirst2021
      )
      isLessThanXDaysFromNowMock = jest
        .spyOn<any, any>(timeUtils, "isLessThanXDaysFromNow")
        .mockReturnValue(true)
    })
    afterAll(() => {
      isLessThanXDaysFromNowMock.mockRestore()
    })

    it("Customer is access-monthly. Return 1 day before nextNextBillingAt", async () => {
      await setCustomerPlanTypeWithParams("access-monthly")
      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        augustThirtyFirst2021
      )
      expectTimeToEqual(
        rentalInvoiceBillingEndAt,
        oneDayBeforeNextNextBillingAt
      )
    })

    it("Customer is access-yearly. Return 30 days from billing start at", async () => {
      await setCustomerPlanTypeWithParams("access-yearly")
      const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
        custWithData.membership.id,
        augustThirtyFirst2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, septemberThirtieth)
    })

    describe("Customer is any other plan. Return 1 day after nextNextBillingAt", () => {
      it("Essential 1", async () => {
        await setCustomerPlanTypeWithParams("essential-1")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })
      it("Essential 2", async () => {
        await setCustomerPlanTypeWithParams("essential-2")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })
      it("Essential", async () => {
        await setCustomerPlanTypeWithParams("essential")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })

      it("Essential 6", async () => {
        await setCustomerPlanTypeWithParams("essential-6")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })
      it("All Access 1", async () => {
        await setCustomerPlanTypeWithParams("all-access-1")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })
      it("All Access 2", async () => {
        await setCustomerPlanTypeWithParams("all-access-2")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })
      it("All Access", async () => {
        await setCustomerPlanTypeWithParams("all-access")
        const rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          augustThirtyFirst2021
        )
        expectTimeToEqual(
          rentalInvoiceBillingEndAt,
          oneDayAfterNextNextBillingAt
        )
      })
    })
  })
  describe("CalculateBillingEndDateFromStartDate", () => {
    it("If the next month has the start date's date, it uses that", async () => {
      const rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        februarySeventh2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, marchSeventh2021)
    })

    it("If the start date is the 31st and the next month only has 30 days, it uses 30", async () => {
      const marchThirtyFirst2021 = new Date(2021, 2, 31)
      const rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        marchThirtyFirst2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 3, 30))
    })

    it("If the start date is 30 and the next month is February in a non leap year, it uses the 28th", async () => {
      const januaryThirty2021 = new Date(2021, 0, 30)
      const rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        januaryThirty2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 1, 28))
    })

    it("If the start date is 30 and the next month is February in a leap year, it uses the 29th", async () => {
      const januaryThirty2024 = new Date(2024, 0, 30)
      const rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        januaryThirty2024
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2024, 1, 29))
    })

    it("If the start date is 29 and the next month is February in a leap year, it uses the 29th", async () => {
      const januaryTwentyNine2024 = new Date(2024, 0, 29)
      const rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        januaryTwentyNine2024
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2024, 1, 29))
    })

    it("If the start date is in december, it creates the billing end at date in the following year", async () => {
      const decemberThirtyOne2021 = new Date(2021, 11, 31)
      const rentalInvoiceBillingEndAt = await rentalService.calculateBillingEndDateFromStartDate(
        decemberThirtyOne2021
      )
      expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2022, 0, 31))
    })
  })
})
