import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService, SmartPrismaClient } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Prisma } from "@prisma/client"
import { merge } from "lodash"
import moment from "moment"

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
  let testCustomer: any

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

  beforeEach(async () => {
    const { cleanupFunc, customer } = await createTestCustomer({
      client: prisma.client,
      utils,
      select: {
        id: true,
        status: true,
        membership: { select: { plan: { select: { tier: true } } } },
        user: true,
      },
    })
    cleanupFuncs.push(cleanupFunc)
    testCustomer = customer
  })

  describe("Calculate Days Rented", () => {
    // Reserved this billing cycle and...
    // still has it
    // returned it
    // lost on the way there
    // lost on the way back

    // Reserved in a previous billing cycle and...
    it("works for an item that was both reserved and returned this billing cycle", async () => {
      const reservableProdVar = await prisma.client.productVariant.findFirst({
        where: { reservable: { gt: 1 } },
      })
      await prisma.client.bagItem.create({
        data: {
          customer: { connect: { id: testCustomer.id } },
          productVariant: { connect: { id: reservableProdVar.id } },
          status: "Added",
          saved: false,
        },
      })
      let reservation = await reservationService.reserveItems(
        [reservableProdVar.id],
        null,
        testCustomer.user,
        testCustomer as any,
        { reservationNumber: true, products: { select: { seasonsUID: true } } }
      )
      const twentyDaysAgo = utils.xDaysAgoISOString(20)
      await prisma.client.reservation.update({
        where: { id: reservation.id },
        data: { createdAt: twentyDaysAgo },
      })

      // Set the deliveredAt timestamps on the sentPackage
      const eighteenDaysAgo = utils.xDaysAgoISOString(18)
      await prisma.client.package.update({
        where: { id: reservation.sentPackage.id },
        data: { deliveredAt: eighteenDaysAgo },
      })

      // process the return
      await reservationService.processReservation(
        reservation.reservationNumber,
        [
          {
            productStatus: "Dirty",
            productUID: reservation.products[0].seasonsUID,
            returned: true,
            notes: "",
          },
        ]
      )

      // run the expects
    })

    it("works for an item on an active reservation that was created this billing cycle", async () => {
      /* Create a 15 day old reservation with a sent package that arrived 10 days ago */
      const reservableProdVar = await prisma.client.productVariant.findFirst({
        where: { reservable: { gt: 1 } },
      })
      await prisma.client.bagItem.create({
        data: {
          customer: { connect: { id: testCustomer.id } },
          productVariant: { connect: { id: reservableProdVar.id } },
          status: "Added",
          saved: false,
        },
      })
      let reservation = await reservationService.reserveItems(
        [reservableProdVar.id],
        null,
        testCustomer.user,
        testCustomer as any
      )
      const fifteenDaysAgo = utils.xDaysAgoISOString(15)
      reservation = await prisma.client.reservation.update({
        where: { id: reservation.id },
        data: { createdAt: fifteenDaysAgo, status: "Delivered" },
        select: {
          sentPackage: { select: { id: true } },
          products: { select: { seasonsUID: true } },
          reservationNumber: true,
        },
      })

      // Set the deliveredAt timestamps on the sentPackage
      const tenDaysAgo = utils.xDaysAgoISOString(10)
      await prisma.client.package.update({
        where: { id: reservation.sentPackage.id },
        data: { deliveredAt: tenDaysAgo },
      })

      const custWithData = await prisma.client.customer.findFirst({
        where: { id: testCustomer.id },
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
      const {
        daysRented,
        comment,
        rentalEndedAt,
        rentalStartedAt,
      } = await subscriptionService.calcDaysRented(
        rentalInvoiceToBill,
        physicalProductToBill
      )
      expect(daysRented).toBe(10)

      const commentIncludesProperReservation = comment
        .toLowerCase()
        .includes(
          `initial reservation: ${reservation.reservationNumber}, status delivered`
        )
      const commentIncludesPackageDelivery = comment
        .toLowerCase()
        .includes(
          `delivered: this billing cycle on ${moment(tenDaysAgo).format(
            "lll"
          )}`.toLowerCase()
        )
      const commentIncludesCurrentStatus = comment
        .toLowerCase()
        .includes(`current status: with customer`)
      expect(commentIncludesProperReservation).toBe(true)
      expect(commentIncludesPackageDelivery).toBe(true)
      expect(commentIncludesCurrentStatus).toBe(true)

      expect(moment(rentalEndedAt).format("ll")).toEqual(moment().format("ll"))
      expect(moment(rentalStartedAt).format("ll")).toEqual(
        moment(tenDaysAgo).format("ll")
      )
    })

    it("works for an item on an active reservation that was created last billing cycle", async () => {
      const reservableProdVar = await prisma.client.productVariant.findFirst({
        where: { reservable: { gt: 1 } },
      })
      await prisma.client.bagItem.create({
        data: {
          customer: { connect: { id: testCustomer.id } },
          productVariant: { connect: { id: reservableProdVar.id } },
          status: "Added",
          saved: false,
        },
      })
      let reservation = await reservationService.reserveItems(
        [reservableProdVar.id],
        null,
        testCustomer.user,
        testCustomer as any
      )

      const fourtyFiveDaysAgo = utils.xDaysAgoISOString(45)
      reservation = await prisma.client.reservation.update({
        where: { id: reservation.id },
        data: { createdAt: fourtyFiveDaysAgo, status: "Delivered" },
        select: {
          sentPackage: { select: { id: true } },
          products: { select: { seasonsUID: true } },
          reservationNumber: true,
        },
      })

      // Set the deliveredAt timestamps on the sentPackage
      const fourtyFourDaysAgo = utils.xDaysAgoISOString(44)
      await prisma.client.package.update({
        where: { id: reservation.sentPackage.id },
        data: { deliveredAt: fourtyFourDaysAgo },
      })

      const custWithData = await prisma.client.customer.findFirst({
        where: { id: testCustomer.id },
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
      const {
        daysRented,
        comment,
        rentalEndedAt,
        rentalStartedAt,
      } = await subscriptionService.calcDaysRented(
        rentalInvoiceToBill,
        physicalProductToBill
      )

      expect(daysRented).toBe(30)

      const commentIncludesProperReservation = comment
        .toLowerCase()
        .includes(
          `initial reservation: ${reservation.reservationNumber}, status delivered`
        )
      const commentIncludesPackageDelivery = comment
        .toLowerCase()
        .includes(
          `delivered: on a previous billing cycle on ${moment(
            fourtyFourDaysAgo
          ).format("lll")}`.toLowerCase()
        )
      const commentIncludesCurrentStatus = comment
        .toLowerCase()
        .includes(`current status: with customer`)
      expect(commentIncludesProperReservation).toBe(true)
      expect(commentIncludesPackageDelivery).toBe(true)
      expect(commentIncludesCurrentStatus).toBe(true)

      expect(moment(rentalEndedAt).format("ll")).toEqual(moment().format("ll"))
      expect(moment(rentalStartedAt).format("ll")).toEqual(
        moment(utils.xDaysAgoISOString(30)).format("ll")
      )
    })

    it("works for an item sent on a now completed reservation that was sent the last billing cycle", async () => {
      expect(1).toBe(0)
    })

    it("works for an item reserved in the previous billing cycle and returned in this one", async () => {
      expect(1).toBe(0)
    })

    it("correctly uses the fallback if we don't know when a sent package got delivered", async () => {
      expect(1).toBe(0)
    })

    it("correctly uses the fallback if we don't know when a return package entered the system", async () => {
      expect(1).toBe(0)
    })

    // STOP HERE FOR NOW

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

const createTestCustomer = async ({
  client,
  utils,
  create = {},
  select = { id: true },
}: {
  client: SmartPrismaClient
  utils: UtilsService
  create?: Partial<Prisma.CustomerCreateInput>
  select?: Prisma.CustomerSelect
}) => {
  const upsGroundMethod = await client.shippingMethod.findFirst({
    where: { code: "UPSGround" },
  })
  const defaultCreateData = {
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
          create: {
            billingStartAt: utils.xDaysAgoISOString(30),
            billingEndAt: new Date(),
          },
        },
      },
    },
  }
  const createData = merge(defaultCreateData, create)
  const customer = await client.customer.create({
    data: createData,
    select: merge(select, { id: true }),
  })
  const cleanupFunc = async () =>
    client.customer.delete({ where: { id: customer.id } })
  return { cleanupFunc, customer }
}

// const calcDaysRented = async (testCustomerId, client, subscriptionService) => {
//   const custWithData = await client.customer.findFirst({
//     where: { id: testCustomerId },
//     select: {
//       membership: {
//         select: {
//           rentalInvoices: {
//             select: {
//               id: true,
//               reservations: true,
//               products: true,
//               status: true,
//               billingStartAt: true,
//               billingEndAt: true,
//             },
//           },
//         },
//       },
//     },
//   })
//   const physicalProductToBill = reservation.products[0]
//   const rentalInvoiceToBill = custWithData.membership.rentalInvoices[0]
//   const {
//     daysRented,
//     comment,
//     rentalEndedAt,
//     rentalStartedAt,
//   } = await subscriptionService.calcDaysRented(
//     rentalInvoiceToBill,
//     physicalProductToBill
//   )
// }
