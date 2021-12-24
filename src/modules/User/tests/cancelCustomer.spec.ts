import { BagService } from "@app/modules/Product/services/bag.service"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { USER_MODULE_DEF } from "@app/modules/User/user.module"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"
import cuid from "cuid"

import { CustomerService } from "../services/customer.service"

/*
Keep these in the global scope so helper funcs have access to them
*/
let testUtilsService: TestUtilsService
let timeUtils: TimeUtilsService
let prismaService: PrismaService

describe("Cancel Customer", () => {
  let testCustomer

  let utilsService: UtilsService
  let customerService: CustomerService
  let bagService: BagService
  let reserveService: ReserveService
  let reservationTestUtils: ReservationTestUtilsService
  let customerWithData
  let rentalInvoiceAfterCancellation
  let invoiceCreateSpy
  let cancelSubscriptionSpy

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(USER_MODULE_DEF).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    testUtilsService = moduleRef.get<TestUtilsService>(TestUtilsService)
    customerService = moduleRef.get<CustomerService>(CustomerService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    utilsService = moduleRef.get<UtilsService>(UtilsService)
    bagService = moduleRef.get<BagService>(BagService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )

    cancelSubscriptionSpy = jest
      .spyOn(chargebee.subscription, "cancel")
      .mockReturnValue({
        request: async () => {
          return {}
        },
      })
  })

  describe("If the invoice runs properly, everything works", () => {
    beforeAll(async () => {
      invoiceCreateSpy = jest
        .spyOn(chargebee.invoice, "create")
        .mockReturnValue({
          request: async () => ({
            invoice: {
              id: cuid(),
              date: Math.round(new Date().getTime() / 1000),
              status: "paid",
              sub_total: 0,
              line_items: [],
            },
          }),
        })

      const { customer } = await createTestCustomer()
      testCustomer = customer
      const rentalInvoiceBeforeCancellation =
        testCustomer.membership.rentalInvoices[0]
      const numDaysToBillingEnd = timeUtils.numDaysBetween(
        rentalInvoiceBeforeCancellation.billingEndAt,
        new Date()
      )
      expect(numDaysToBillingEnd).toBeGreaterThan(0)

      const {
        bagItems,
        reservation,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        numProductsToAdd: 1,
        customer: testCustomer,
        options: { numDaysAgo: 25 },
      })
      await prismaService.client.reservationPhysicalProduct.updateMany({
        where: {
          reservation: { id: reservation.id },
        },
        data: { status: "AtHome" },
      })

      await prismaService.client.bagItem.delete({
        where: { id: bagItems[0].id },
      })

      await customerService.cancelCustomer(testCustomer.id)

      customerWithData = await getCustomerWithData(prismaService, testCustomer)
      rentalInvoiceAfterCancellation =
        customerWithData.membership.rentalInvoices[0]
    })

    afterAll(async () => {
      cancelSubscriptionSpy.mockClear()
      invoiceCreateSpy.mockClear()
    })

    it("Does not create another rental invoice", () => {
      expect(customerWithData.membership.rentalInvoices.length).toBe(1)
    })

    it("Sets the billingEndsAt date to today", () => {
      const numDaysToBillingEnd = timeUtils.numDaysBetween(
        rentalInvoiceAfterCancellation.billingEndAt,
        new Date()
      )
      expect(numDaysToBillingEnd).toBe(0)
    })

    it("Bills the invoice", () => {
      expect(rentalInvoiceAfterCancellation.status).toBe("Billed")
    })

    it("Creates the invoice immediately rather than adding pending charges", () => {
      expect(invoiceCreateSpy).toHaveBeenCalledTimes(1)
    })

    it("Cancels the customer's subscription in chargebee", () => {
      expect(cancelSubscriptionSpy).toHaveBeenCalledTimes(1)
    })

    it("Marks the customer as deactivated in our system", () => {
      expect(customerWithData.status).toBe("Deactivated")
    })
  })

  describe("If the invoice errors, we don't cancel the customer", () => {
    let expectedError
    let rentalInvoiceBeforeCancellation
    beforeAll(async () => {
      invoiceCreateSpy = jest
        .spyOn(chargebee.invoice, "create")
        .mockReturnValue({
          request: async () => {
            throw "Test Error"
          },
        })
      const { customer } = await createTestCustomer()
      testCustomer = customer
      rentalInvoiceBeforeCancellation =
        testCustomer.membership.rentalInvoices[0]
      const numDaysToBillingEnd = timeUtils.numDaysBetween(
        rentalInvoiceBeforeCancellation.billingEndAt,
        new Date()
      )
      expect(numDaysToBillingEnd).toBeGreaterThan(0)
      const {
        bagItems,
        reservation,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        numProductsToAdd: 1,
        customer: testCustomer,
        options: { numDaysAgo: 25 },
      })
      await prismaService.client.reservationPhysicalProduct.updateMany({
        where: {
          reservation: { id: reservation.id },
        },
        data: { status: "AtHome" },
      })

      await prismaService.client.bagItem.delete({
        where: { id: bagItems[0].id },
      })

      try {
        await customerService.cancelCustomer(testCustomer.id)
      } catch (err) {
        expectedError = err
      }

      customerWithData = await getCustomerWithData(prismaService, testCustomer)
      rentalInvoiceAfterCancellation =
        customerWithData.membership.rentalInvoices[0]
    })

    it("Does not create another rental invoice", () => {
      expect(customerWithData.membership.rentalInvoices.length).toBe(1)
    })

    it("Leaves the billingEndAt date untouched", () => {
      const numDaysToBillingEnd = timeUtils.numDaysBetween(
        rentalInvoiceAfterCancellation.billingEndAt,
        rentalInvoiceBeforeCancellation.billingEndAt
      )
      expect(numDaysToBillingEnd).toBe(0)
    })

    it("Throws the expected error", () => {
      expect(invoiceCreateSpy).toHaveBeenCalledTimes(1)
    })

    it("Marks the invoice as ChargeFailed", () => {
      expect(rentalInvoiceAfterCancellation.status).toBe("ChargeFailed")
    })

    it("Does not cancel the subscription in chargebee", () => {
      expect(cancelSubscriptionSpy).toHaveBeenCalledTimes(0)
    })

    it("Does not mark the customer as deactivated in our system", () => {
      expect(customerWithData.status).toBe("Active")
    })
  })

  describe("If the customer has a reserved bag item, we throw an error", () => {
    let expectedError
    beforeAll(async () => {
      const { customer } = await createTestCustomer()
      testCustomer = customer

      await reservationTestUtils.addToBagAndReserveForCustomer({
        numProductsToAdd: 1,
        customer: testCustomer,
        options: { numDaysAgo: 25 },
      })

      try {
        await customerService.cancelCustomer(testCustomer.id)
      } catch (err) {
        expectedError = err
      }
    })

    it("Throws the proper error", () => {
      expect(expectedError.message).toBe(
        "Unable to cancel customer. Has 1 or more reserved items in bag"
      )
    })
  })
})

const getCustomerWithData = async (prismaService, testCustomer) =>
  await prismaService.client.customer.findUnique({
    where: { id: testCustomer.id },
    select: {
      status: true,
      membership: {
        select: {
          rentalInvoices: {
            orderBy: { createdAt: "desc" },
            select: { id: true, status: true, billingEndAt: true },
          },
        },
      },
    },
  })

const createTestCustomer = async () => {
  return await testUtilsService.createTestCustomer({
    create: {
      membership: {
        create: {
          rentalInvoices: {
            create: {
              billingStartAt: timeUtils.xDaysAgoISOString(29),
              billingEndAt: timeUtils.xDaysFromNowISOString(1),
            },
          },
        } as any,
      },
    },
    select: {
      membership: {
        select: {
          rentalInvoices: {
            orderBy: { createdAt: "desc" },
            select: { billingEndAt: true },
          },
        },
      },
    },
  })
}
