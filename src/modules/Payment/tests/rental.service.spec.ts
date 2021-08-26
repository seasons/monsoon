import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService, SmartPrismaClient } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Prisma, ReservationStatus } from "@prisma/client"
import { head, merge } from "lodash"
import moment from "moment"

import { PaymentService } from "../services/payment.service"
import { RentalService } from "../services/rental.service"

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

let prisma: PrismaService
let rentalService: RentalService
let reservationService: ReservationService
let utils: UtilsService
let cleanupFuncs = []
let testCustomer: any

describe("Rental Service", () => {
  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)
    moduleBuilder.overrideProvider(PaymentService).useClass(PaymentServiceMock)

    const moduleRef = await moduleBuilder.compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    utils = moduleRef.get<UtilsService>(UtilsService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
  })

  afterAll(async () => {
    await Promise.all(cleanupFuncs.map(a => a()))
  })

  describe("Calculate Days Rented", () => {
    beforeEach(async () => {
      const { cleanupFunc, customer } = await createTestCustomer({
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
    // Reserved this billing cycle and...
    // still has it
    // returned it
    // lost on the way there
    // lost on the way back

    describe("Items reserved in this billing cycle", () => {
      let initialReservation: any
      let custWithData: any
      let twentyThreeDaysAgo
      const now = new Date()

      beforeEach(async () => {
        initialReservation = (await addToBagAndReserveForCustomer(1)) as any
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Delivered")
        custWithData = await getCustWithData()
        twentyThreeDaysAgo = utils.xDaysAgoISOString(23)
      })

      it("reserved and returned on same reservation", async () => {
        // process the return
        const returnPackage = head(initialReservation.returnPackages)
        await setPackageEnteredSystemAt(returnPackage.id, 2)
        await reservationService.processReservation(
          initialReservation.reservationNumber,
          [
            {
              productStatus: "Dirty",
              productUID: initialReservation.products[0].seasonsUID,
              returned: true,
              notes: "",
            },
          ],
          returnPackage.shippingLabel.trackingNumber
        )

        // Calculate
        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        // run the expects
        const twoDaysAgo = utils.xDaysAgoISOString(2)
        expect(daysRented).toBe(21)
        expect(moment(rentalEndedAt).format("ll")).toEqual(
          moment(twoDaysAgo).format("ll")
        )
        expect(moment(rentalStartedAt).format("ll")).toEqual(
          moment(twentyThreeDaysAgo).format("ll")
        )

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "completed"
        )
        expectCommentToInclude(comment, `item status: returned`)
      })

      it("reserved and returned on later reservation", async () => {
        const reservationTwo = (await addToBagAndReserveForCustomer(1)) as any
        await setReservationStatus(reservationTwo.id, "Delivered")
        const reservationThree = (await addToBagAndReserveForCustomer(3)) as any
        await setReservationStatus(reservationThree.id, "Delivered")

        // Return it with the label from the last reservation
        const returnPackage = head(reservationThree.returnPackages)
        await setPackageEnteredSystemAt(returnPackage.id, 4)
        await reservationService.processReservation(
          reservationThree.reservationNumber,
          reservationThree.products.map(a => ({
            productStatus: "Dirty",
            productUID: a.seasonsUID,
            returned: true,
            notes: "",
          })),
          returnPackage.shippingLabel.trackingNumber
        )

        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(19)
        expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
        expectTimeToEqual(rentalEndedAt, utils.xDaysAgoISOString(4))

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "completed"
        )
        expectCommentToInclude(comment, `item status: returned`)
      })

      it("reserved and held. no new reservations since initial", async () => {
        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(23)
        expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
        expectTimeToEqual(rentalEndedAt, now)

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "delivered"
        )
        expectCommentToInclude(comment, "item status: with customer")
      })

      it("reserved and held. made 2 new reservations since initial", async () => {
        const reservationTwo = (await addToBagAndReserveForCustomer(2)) as any
        await setReservationStatus(reservationTwo.id, "Delivered")
        const reservationThree = (await addToBagAndReserveForCustomer(1)) as any
        await setReservationStatus(reservationThree.id, "Delivered")

        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(23)
        expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
        expectTimeToEqual(rentalEndedAt, now)

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "completed"
        )
        expectCommentToInclude(comment, "item status: with customer")
      })

      // Queued, Hold, Picked, Packed, Unknown, Blocked = 0

      // Shipped, on the way there = 0
      // Shipped, on the way back: rentalEndedAt f of whether or not package in system.
      // Lost on the way there, lost on the way back

      // Cancelled
    })

    describe("Items reserved in a previous billing cycle", () => {})

    it("works for an item that was returned using a previous reservation's return package label", async () => {
      expect(0).toBe(1)
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
      } = await rentalService.calcDaysRented(
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
      const commentIncludesItemStatus = comment
        .toLowerCase()
        .includes(`item status: with customer`)
      expect(commentIncludesProperReservation).toBe(true)
      expect(commentIncludesPackageDelivery).toBe(true)
      expect(commentIncludesItemStatus).toBe(true)

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
  create = {},
  select = { id: true },
}: {
  create?: Partial<Prisma.CustomerCreateInput>
  select?: Prisma.CustomerSelect
}) => {
  const upsGroundMethod = await prisma.client.shippingMethod.findFirst({
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
  const customer = await prisma.client.customer.create({
    data: createData,
    select: merge(select, { id: true }),
  })
  const cleanupFunc = async () =>
    prisma.client.customer.delete({ where: { id: customer.id } })
  return { cleanupFunc, customer }
}

const addToBagAndReserveForCustomer = async numProductsToAdd => {
  const reservedBagItems = await prisma.client.bagItem.findMany({
    where: {
      customer: { id: testCustomer.id },
      status: "Reserved",
      saved: false,
    },
    select: { productVariant: { select: { sku: true } } },
  })
  const reservedSKUs = reservedBagItems.map(a => a.productVariant.sku)
  const reservableProdVars = await prisma.client.productVariant.findMany({
    where: { reservable: { gte: 1 }, sku: { notIn: reservedSKUs } },
    take: numProductsToAdd,
  })
  for (const prodVar of reservableProdVars) {
    await prisma.client.bagItem.create({
      data: {
        customer: { connect: { id: testCustomer.id } },
        productVariant: { connect: { id: prodVar.id } },
        status: "Added",
        saved: false,
      },
    })
  }

  const bagItemsToReserve = await prisma.client.bagItem.findMany({
    where: {
      customer: { id: testCustomer.id },
      status: { in: ["Added", "Reserved"] },
      saved: false,
    },
    select: { productVariant: { select: { id: true } } },
  })
  const prodVarsToReserve = bagItemsToReserve.map(a => a.productVariant.id)
  const reservation = await reservationService.reserveItems(
    prodVarsToReserve,
    null,
    testCustomer.user,
    testCustomer as any,
    {
      reservationNumber: true,
      products: { select: { seasonsUID: true } },
      sentPackage: { select: { id: true } },
      returnPackages: {
        select: {
          id: true,
          shippingLabel: { select: { trackingNumber: true } },
        },
      },
    }
  )

  return reservation
}

const setPackageDeliveredAt = async (packageId, numDaysAgo) => {
  const eighteenDaysAgo = utils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.package.update({
    where: { id: packageId },
    data: { deliveredAt: eighteenDaysAgo },
  })
}

const setReservationStatus = async (
  reservationId,
  status: ReservationStatus
) => {
  await prisma.client.reservation.update({
    where: { id: reservationId },
    data: { status },
  })
}
const setReservationCreatedAt = async (reservationId, numDaysAgo) => {
  const date = utils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservation.update({
    where: { id: reservationId },
    data: { createdAt: date },
  })
}

const setPackageEnteredSystemAt = async (packageId, numDaysAgo) => {
  const date = utils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.package.update({
    where: { id: packageId },
    data: { enteredDeliverySystemAt: date },
  })
}

const getCustWithData = async () => {
  return await prisma.client.customer.findFirst({
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
}

const expectInitialReservationComment = (
  comment,
  reservationNumber,
  status
) => {
  const commentIncludesProperReservation = comment
    .toLowerCase()
    .includes(`initial reservation: ${reservationNumber}, status ${status}`)
  expect(commentIncludesProperReservation).toBe(true)
}

const expectCommentToInclude = (comment, expectedLine) => {
  const doesInclude = comment.toLowerCase().includes(expectedLine)
  expect(doesInclude).toBe(true)
}

const expectTimeToEqual = (time, expectedValue) => {
  expect(moment(time).format("ll")).toEqual(moment(expectedValue).format("ll"))
}
