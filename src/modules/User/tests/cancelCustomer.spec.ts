import { create } from "domain"

import { BagService } from "@app/modules/Product/services/bag.service"
import { ReservationService } from "@app/modules/Reservation"
import { USER_MODULE_DEF } from "@app/modules/User/user.module"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Res } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import chargebee from "chargebee"

import { CustomerService } from "../services/customer.service"
import { ReservationStatus, prisma } from ".prisma/client"

let timeUtils: TimeUtilsService
let testUtilsService: TestUtilsService
let prismaService: PrismaService
let utilsService: UtilsService

describe("Cancel Customer", () => {
  let testCustomer

  let customerService: CustomerService
  let bagService: BagService
  let reservationService: ReservationService
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
    reservationService = moduleRef.get<ReservationService>(ReservationService)

    cancelSubscriptionSpy = jest
      .spyOn(chargebee.subscription, "cancel_for_items")
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
              status: "paid",
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

      const reservableProductVariant = await prismaService.client.productVariant.findFirst(
        {
          where: {
            reservable: { gte: 1 }, // want two because we want to ensure the correct one of two (or more) is picked
          },
          select: {
            id: true,
          },
        }
      )
      await bagService.addToBag(reservableProductVariant.id, testCustomer, {
        id: true,
      })
      const reservationWithData = await reservationService.reserveItems({
        items: [reservableProductVariant.id],
        shippingCode: "UPSGround",
        customer: testCustomer,
        select: { id: true, sentPackage: { select: { id: true } } },
      })
      await setReservationCreatedAt(reservationWithData.id, 25)
      await setPackageDeliveredAt(reservationWithData.sentPackage.id, 23)
      await setReservationStatus(reservationWithData.id, "Delivered")

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

      const reservableProductVariant = await prismaService.client.productVariant.findFirst(
        {
          where: {
            reservable: { gte: 1 }, // want two because we want to ensure the correct one of two (or more) is picked
          },
          select: {
            id: true,
          },
        }
      )
      await bagService.addToBag(reservableProductVariant.id, testCustomer, {
        id: true,
      })
      const reservationWithData = await reservationService.reserveItems({
        items: [reservableProductVariant.id],
        shippingCode: "UPSGround",
        customer: testCustomer,
        select: { id: true, sentPackage: { select: { id: true } } },
      })
      await setReservationCreatedAt(reservationWithData.id, 25)
      await setPackageDeliveredAt(reservationWithData.sentPackage.id, 23)
      await setReservationStatus(reservationWithData.id, "Delivered")

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

      const reservableProductVariant = await prismaService.client.productVariant.findFirst(
        {
          where: {
            reservable: { gte: 1 }, // want two because we want to ensure the correct one of two (or more) is picked
          },
          select: {
            id: true,
          },
        }
      )
      await bagService.addToBag(reservableProductVariant.id, testCustomer, {
        id: true,
      })
      const reservationWithData = await reservationService.reserveItems({
        items: [reservableProductVariant.id],
        shippingCode: "UPSGround",
        customer: testCustomer,
        select: { id: true, sentPackage: { select: { id: true } } },
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

const setReservationCreatedAt = async (reservationId, numDaysAgo) => {
  const date = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prismaService.client.reservation.update({
    where: { id: reservationId },
    data: { createdAt: date },
  })
}

const setPackageDeliveredAt = async (packageId, numDaysAgo) => {
  const eighteenDaysAgo = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prismaService.client.package.update({
    where: { id: packageId },
    data: { deliveredAt: eighteenDaysAgo },
  })
}

const setReservationStatus = async (
  reservationId,
  status: ReservationStatus
) => {
  await prismaService.client.reservation.update({
    where: { id: reservationId },
    data: { status },
  })
}
