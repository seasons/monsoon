import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService, SmartPrismaClient } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Prisma } from "@prisma/client"
import { merge } from "lodash"

import { PaymentModuleDef } from "../payment.module"
import { PaymentService } from "../services/payment.service"
import { SubscriptionService } from "../services/subscription.service"

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

describe("Subscription Service", () => {
  let prisma: PrismaService
  let subscriptionService: SubscriptionService
  let reservationService: ReservationService
  let testUtils: TestUtilsService
  let utils: UtilsService
  let cleanupFuncs = []

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)
    moduleBuilder.overrideProvider(PaymentService).useClass(PaymentServiceMock)

    const moduleRef = await moduleBuilder.compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    subscriptionService = moduleRef.get<SubscriptionService>(
      SubscriptionService
    )
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    utils = moduleRef.get<UtilsService>(UtilsService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
  })

  afterAll(async () => {
    await Promise.all(cleanupFuncs.map(a => a()))
  })

  describe("Calculate Days Rented", () => {
    it("works for an item on an active reservation that was created this billing cycle", async () => {
      const { cleanupFunc, customer } = await createTestCustomer(
        prisma.client,
        utils,
        {
          id: true,
          status: true,
          membership: { select: { plan: { select: { tier: true } } } },
          user: true,
        }
      )
      cleanupFuncs.push(cleanupFunc)

      // Add some bag items and reserve for the customer. Set createdAt to 15 days ago
      const reservableProdVar = await prisma.client.productVariant.findFirst({
        where: { reservable: { gt: 1 } },
      })
      await prisma.client.bagItem.create({
        data: {
          customer: { connect: { id: customer.id } },
          productVariant: { connect: { id: reservableProdVar.id } },
          status: "Added",
          saved: false,
        },
      })
      let reservation = await reservationService.reserveItems(
        [reservableProdVar.id],
        null,
        customer.user,
        customer as any
      )
      const fifteenDaysAgo = new Date()
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
      reservation = await prisma.client.reservation.update({
        where: { id: reservation.id },
        data: { createdAt: fifteenDaysAgo },
        select: {
          sentPackage: { select: { id: true } },
          products: { select: { seasonsUID: true } },
        },
      })

      // Set the deliveredAt timestamps on the sentPackage
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
      await prisma.client.package.update({
        where: { id: reservation.sentPackage.id },
        data: { deliveredAt: tenDaysAgo },
      })

      const custWithData = await prisma.client.customer.findFirst({
        where: { id: customer.id },
        select: {
          membership: {
            select: {
              rentalInvoices: {
                select: {
                  id: true,
                  reservations: true,
                  products: true,
                  status: true,
                  billingStartAt: true,
                  billingEndAt: true,
                },
              },
            },
          },
        },
      })
      const physicalProductToBill = reservation.products[0]
      const rentalInvoiceToBill = custWithData.membership.rentalInvoices[0]
      const { daysRented } = await subscriptionService.calcDaysRented(
        rentalInvoiceToBill,
        physicalProductToBill
      )
      expect(daysRented).toBe(10)
      // expect comment
      // expect rentalStartedAt
      // expect rentalEndedAt
    })

    it("correctly uses the fallback if we don't know when a sent package got delivered", async () => {})

    it("correctly uses the fallback if we don't know when a return package entered the system", async () => {})

    it("works for an item that was both reserved and returned this billing cycle", async () => {
      expect(1).toBe(0)
    })

    it("works for an item reserved in the previous billing cycle and returned in this one", async () => {
      expect(1).toBe(0)
    })

    it("works for an item that was reserved 3 months ago and is still held by the customer", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a Queued reservation", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a Picked reservation", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a Packed reservation", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a Cancelled reservation", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a reservation with status Hold", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a reservation with status Blocked", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a reservation with status Unknown", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a reservation with status Shipped in BusinessToCustomer phase", async () => {
      expect(1).toBe(0)
    })

    it("works for items on a reservation with status Shipped in CustomerToBusiness phase", async () => {
      expect(1).toBe(0)
    })

    it("works for items lost on the way to the customer", async () => {
      expect(1).toBe(0)
    })

    it("works for items lost on the way back to us", async () => {
      expect(1).toBe(0)
    })
  })
})

const createTestCustomer = async (
  client: SmartPrismaClient,
  utils,
  select: Prisma.CustomerSelect
) => {
  const upsGroundMethod = await client.shippingMethod.findFirst({
    where: { code: "UPSGround" },
  })
  const customer = await client.customer.create({
    data: {
      status: "Active",
      user: {
        create: {
          auth0Id: utils.randomString(),
          email: utils.randomString() + "@seasons.nyc",
          firstName: utils.randomString(),
          lastName: utils.randomString(),
        },
      },
      detail: {
        create: {
          shippingAddress: {
            create: {
              address1: "55 Washingston St",
              city: "Brooklyn",
              state: "NY",
              zipCode: "11201",
              shippingOptions: {
                create: {
                  shippingMethod: { connect: { id: upsGroundMethod.id } },
                  externalCost: 10,
                },
              },
            },
          },
        },
      },
      membership: {
        create: {
          subscriptionId: utils.randomString(),
          plan: { connect: { planID: "access-monthly" } },
          rentalInvoices: {
            // TODO: Change these dates
            create: { billingStartAt: new Date(), billingEndAt: new Date() },
          },
        },
      },
    },
    select: merge(select, { id: true }),
  })
  const cleanupFunc = async () =>
    client.customer.delete({ where: { id: customer.id } })
  return { cleanupFunc, customer }
}
