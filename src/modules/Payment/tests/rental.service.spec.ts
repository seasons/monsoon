import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService, SmartPrismaClient } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Prisma, ReservationStatus } from "@prisma/client"
import { head, merge } from "lodash"
import moment from "moment"

import { PaymentService } from "../services/payment.service"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../services/rental.service"

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

const testCustomerSelect = Prisma.validator<Prisma.CustomerSelect>()({
  id: true,
  status: true,
  membership: { select: { plan: { select: { tier: true } } } },
  user: true,
})
describe("Rental Service", () => {
  const now = new Date()

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)
    moduleBuilder.overrideProvider(PaymentService).useClass(PaymentServiceMock)

    const moduleRef = await moduleBuilder.compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    utils = moduleRef.get<UtilsService>(UtilsService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
  })

  // Bring this back if we get cascading deletes figured out
  // afterAll(async () => {
  //   await Promise.all(cleanupFuncs.map(a => a()))
  // })

  describe("Calculate Days Rented", () => {
    beforeEach(async () => {
      const { cleanupFunc, customer } = await createTestCustomer({
        select: testCustomerSelect,
      })
      cleanupFuncs.push(cleanupFunc)
      testCustomer = customer
    })

    describe("Items reserved in this billing cycle", () => {
      describe("Core flows", () => {
        let initialReservation: any
        let custWithData: any
        let twentyThreeDaysAgo

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
          expect(daysRented).toBe(21)
          expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
          expectTimeToEqual(rentalEndedAt, utils.xDaysAgoISOString(2))

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
          const reservationThree = (await addToBagAndReserveForCustomer(
            3
          )) as any
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
          const reservationThree = (await addToBagAndReserveForCustomer(
            1
          )) as any
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
      })

      describe("Reservation in processing", () => {
        let initialReservation: any
        let custWithData: any

        beforeEach(async () => {
          initialReservation = (await addToBagAndReserveForCustomer(1)) as any
          custWithData = await getCustWithData()
        })

        it("Sent on a Queued reservation", async () => {
          setReservationStatus(initialReservation.id, "Queued")

          const {
            daysRented,
            comment,
            rentalEndedAt,
            rentalStartedAt,
          } = await rentalService.calcDaysRented(
            custWithData.membership.rentalInvoices[0],
            initialReservation.products[0]
          )

          expect(daysRented).toBe(0)
          expect(rentalStartedAt).toBe(undefined)
          expect(rentalEndedAt).toBe(undefined)

          expectInitialReservationComment(
            comment,
            initialReservation.reservationNumber,
            "queued"
          )
          expectCommentToInclude(comment, "item status: preparing for shipment")
        })

        it("Sent on a Picked reservation", async () => {
          setReservationStatus(initialReservation.id, "Picked")

          const {
            daysRented,
            comment,
            rentalEndedAt,
            rentalStartedAt,
          } = await rentalService.calcDaysRented(
            custWithData.membership.rentalInvoices[0],
            initialReservation.products[0]
          )

          expect(daysRented).toBe(0)
          expect(rentalStartedAt).toBe(undefined)
          expect(rentalEndedAt).toBe(undefined)

          expectInitialReservationComment(
            comment,
            initialReservation.reservationNumber,
            "picked"
          )
          expectCommentToInclude(comment, "item status: preparing for shipment")
        })

        it("Sent on a Packed reservation", async () => {
          setReservationStatus(initialReservation.id, "Packed")

          const {
            daysRented,
            comment,
            rentalEndedAt,
            rentalStartedAt,
          } = await rentalService.calcDaysRented(
            custWithData.membership.rentalInvoices[0],
            initialReservation.products[0]
          )

          expect(daysRented).toBe(0)
          expect(rentalStartedAt).toBe(undefined)
          expect(rentalEndedAt).toBe(undefined)

          expectInitialReservationComment(
            comment,
            initialReservation.reservationNumber,
            "packed"
          )
          expectCommentToInclude(comment, "item status: preparing for shipment")
        })

        it("Sent on a reservation with status Unknown", async () => {
          setReservationStatus(initialReservation.id, "Unknown")

          const {
            daysRented,
            comment,
            rentalEndedAt,
            rentalStartedAt,
          } = await rentalService.calcDaysRented(
            custWithData.membership.rentalInvoices[0],
            initialReservation.products[0]
          )

          expect(daysRented).toBe(0)
          expect(rentalStartedAt).toBe(undefined)
          expect(rentalEndedAt).toBe(undefined)

          expectInitialReservationComment(
            comment,
            initialReservation.reservationNumber,
            "unknown"
          )
          expectCommentToInclude(comment, "item status: unknown")
        })

        it("Sent on a reservation with status Blocked", async () => {
          setReservationStatus(initialReservation.id, "Blocked")

          const {
            daysRented,
            comment,
            rentalEndedAt,
            rentalStartedAt,
          } = await rentalService.calcDaysRented(
            custWithData.membership.rentalInvoices[0],
            initialReservation.products[0]
          )

          expect(daysRented).toBe(0)
          expect(rentalStartedAt).toBe(undefined)
          expect(rentalEndedAt).toBe(undefined)

          expectInitialReservationComment(
            comment,
            initialReservation.reservationNumber,
            "blocked"
          )
          expectCommentToInclude(comment, "item status: unknown")
        })

        it("Sent on a reservation with status Hold", async () => {
          setReservationStatus(initialReservation.id, "Hold")

          const {
            daysRented,
            comment,
            rentalEndedAt,
            rentalStartedAt,
          } = await rentalService.calcDaysRented(
            custWithData.membership.rentalInvoices[0],
            initialReservation.products[0]
          )

          expect(daysRented).toBe(0)
          expect(rentalStartedAt).toBe(undefined)
          expect(rentalEndedAt).toBe(undefined)

          expectInitialReservationComment(
            comment,
            initialReservation.reservationNumber,
            "hold"
          )
          expectCommentToInclude(comment, "item status: unknown")
        })
      })

      it("Shipped, on the way there", async () => {
        let initialReservation = (await addToBagAndReserveForCustomer(1)) as any
        let custWithData = await getCustWithData()
        setReservationStatus(initialReservation.id, "Shipped")

        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "shipped"
        )
        expectCommentToInclude(comment, "item status: en route to customer")
      })

      it("Shipped, on the way back", async () => {
        // Shipped, on the way back: rentalEndedAt function of whether or not package in system.
        expect(0).toBe(1)
      })

      it("lost on the way there", async () => {
        // Simulate a package getting lost en route to the customer
        let initialReservation = (await addToBagAndReserveForCustomer(1)) as any
        await setReservationCreatedAt(initialReservation.id, 25)
        await prisma.client.reservation.update({
          where: { id: initialReservation.id },
          data: { status: "Shipped" },
        })
        await reservationService.updateReservation(
          { status: "Lost" },
          { id: initialReservation.id },
          {}
        )

        const custWithData = await getCustWithData()
        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "lost"
        )
        expectCommentToInclude(
          comment,
          "item status: lost en route to customer"
        )
      })

      it("lost on the way back", async () => {
        expect(0).toBe(1)
      })

      it("sent on a Cancelled reservation", async () => {
        // Simulate a package getting Cancelled by Ops
        let initialReservation = (await addToBagAndReserveForCustomer(1)) as any
        await setReservationCreatedAt(initialReservation.id, 25)
        await reservationService.updateReservation(
          { status: "Cancelled" },
          { id: initialReservation.id },
          {}
        )

        const custWithData = await getCustWithData()
        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "cancelled"
        )
        expectCommentToInclude(
          comment,
          "item status: never sent. initial reservation cancelled"
        )
      })
    })

    describe("Items reserved in a previous billing cycle", () => {
      it("reserved and held, no new reservations", async () => {
        let initialReservation = (await addToBagAndReserveForCustomer(1)) as any
        await setReservationCreatedAt(initialReservation.id, 45)
        await setReservationStatus(initialReservation.id, "Delivered")
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 44)

        const custWithData = await getCustWithData()
        const {
          daysRented,
          comment,
          rentalEndedAt,
          rentalStartedAt,
        } = await rentalService.calcDaysRented(
          custWithData.membership.rentalInvoices[0],
          initialReservation.products[0]
        )

        expect(daysRented).toBe(30)
        expectTimeToEqual(rentalStartedAt, utils.xDaysAgoISOString(30))
        expectTimeToEqual(rentalEndedAt, now)

        expectInitialReservationComment(
          comment,
          initialReservation.reservationNumber,
          "delivered"
        )
        expectCommentToInclude(comment, "Item status: with customer")
      })

      // TODO: flesh out
    })

    // TODO: Test fallbacks
    // TODO: Test using a previous reservation's return label
    // TODO: Item's initial reservation is cancelled. Then is held and sent on a following reservation
  })

  describe("Create Rental Invoice Line Items", () => {
    describe("Properly creates line items for an invoice with 3 reservations and 4 products", () => {
      let lineItemsBySUID
      let expectedResultsBySUID
      let lineItemsPhysicalProductSUIDs
      let invoicePhysicalProductSUIDs

      beforeAll(async () => {
        const { cleanupFunc, customer } = await createTestCustomer({
          select: testCustomerSelect,
        })
        cleanupFuncs.push(cleanupFunc)
        testCustomer = customer

        // Two delivered reservations
        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Delivered")

        const reservationTwo = await addToBagAndReserveForCustomer(1)
        await setReservationCreatedAt(reservationTwo.id, 10)
        await setPackageDeliveredAt(reservationTwo.sentPackage.id, 9)
        await setReservationStatus(reservationTwo.id, "Delivered")

        // One queued reservation
        const reservationThree = await addToBagAndReserveForCustomer(1)
        await setReservationCreatedAt(reservationTwo.id, 2)

        // Override product prices so we can predict the proper price
        const custWithData = (await getCustWithData({
          membership: {
            select: {
              rentalInvoices: {
                select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
              },
            },
          },
        })) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const rentalPriceOverrides = [30, 50, 80, 100]
        invoicePhysicalProductSUIDs = rentalInvoice.products.map(
          a => a.seasonsUID
        )
        for (const [i, overridePrice] of rentalPriceOverrides.entries()) {
          const prodToUpdate = await prisma.client.product.findFirst({
            where: {
              variants: {
                some: {
                  physicalProducts: {
                    some: { seasonsUID: invoicePhysicalProductSUIDs[i] },
                  },
                },
              },
            },
          })
          const updatedProduct = await prisma.client.product.update({
            where: { id: prodToUpdate.id },
            data: { rentalPriceOverride: overridePrice },
            select: { id: true, rentalPriceOverride: true },
          })
          console.log(updatedProduct)
        }

        const rentalInvoiceWithUpdatedPrices = await prisma.client.rentalInvoice.findUnique(
          {
            where: { id: rentalInvoice.id },
            select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
          }
        )
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoiceWithUpdatedPrices
        )

        const lineItemsWithData = await prisma.client.rentalInvoiceLineItem.findMany(
          {
            where: { id: { in: (await lineItems).map(a => a.id) } },
            select: { physicalProduct: { select: { seasonsUID: true } } },
          }
        )
        lineItemsPhysicalProductSUIDs = lineItemsWithData.map(
          a => a.physicalProduct.seasonsUID
        )

        const initialReservationProductSUIDs = initialReservation.products.map(
          a => a.seasonsUID
        )
        const reservationTwoSUIDs = reservationTwo.products.map(
          b => b.seasonsUID
        )
        const reservationThreeSUIDs = reservationThree.products.map(
          c => c.seasonsUID
        )
        lineItemsBySUID = lineItemsWithData.reduce((acc, curVal) => {
          return { ...acc, [curVal.physicalProduct.seasonsUID]: curVal }
        }, {})
        expectedResultsBySUID = {
          [initialReservationProductSUIDs[0]]: {
            daysRented: 23,
            rentalStartedAt: utils.xDaysAgoISOString(23),
            rentalEndedAt: now,
            price: 23,
          },
          [initialReservationProductSUIDs[1]]: {
            daysRented: 23,
            rentalStartedAt: utils.xDaysAgoISOString(23),
            rentalEndedAt: now,
            price: 38.41,
          },
          [reservationTwoSUIDs[0]]: {
            daysRented: 9,
            rentalStartedAt: utils.xDaysAgoISOString(9),
            rentalEndedAt: now,
            price: 24.03,
          },
          [reservationThreeSUIDs[0]]: {
            daysRented: 0,
            rentalStartedAt: null,
            rentalEndedAt: null,
            price: 0,
          },
        }
      })

      it("Creates a line item for each physical product on the invoice", () => {
        expect(lineItemsPhysicalProductSUIDs.sort()).toEqual(
          invoicePhysicalProductSUIDs.sort()
        )
      })

      it("Stores the proper value of days Rented", () => {
        for (const suid of invoicePhysicalProductSUIDs) {
          expect(lineItemsBySUID[suid].daysRented).toEqual(
            expectedResultsBySUID[suid].daysRented
          )
        }
      })

      it("Stores the proper values for rentalStartedAt and rentalEndedAt", () => {
        for (const suid of invoicePhysicalProductSUIDs) {
          expectTimeToEqual(
            lineItemsBySUID["rentalStartedAt"],
            expectedResultsBySUID[suid].rentalStartedAt
          )
          expectTimeToEqual(
            lineItemsBySUID["rentalEndedAt"],
            expectedResultsBySUID[suid].rentalEndedAt
          )
        }
      })

      it("Stores the proper price", () => {
        for (const suid of invoicePhysicalProductSUIDs) {
          expect(lineItemsBySUID[suid].price).toEqual(
            expectedResultsBySUID[suid].price
          )
        }
      })

      it("Stores the proper taxes", () => {
        expect(0).toBe(1)
      })
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
    select: {
      productVariant: {
        select: { sku: true, product: { select: { id: true } } },
      },
    },
  })
  const reservedSKUs = reservedBagItems.map(a => a.productVariant.sku)
  const reservedProductIds = reservedBagItems.map(
    b => b.productVariant.product.id
  )
  const reservableProdVars = await prisma.client.productVariant.findMany({
    where: {
      reservable: { gte: 1 },
      sku: { notIn: reservedSKUs },
      // Ensure we reserve diff products each time. Needed for some tests
      product: { id: { notIn: reservedProductIds } },
      // We shouldn't need to check this since we're checking counts,
      // but there's some corrupt data so we do this to circumvent that.
      physicalProducts: { some: { inventoryStatus: "Reservable" } },
    },
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
  return await reservationService.reserveItems(
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

const getCustWithData = async (
  select: Prisma.CustomerSelect = {}
): Promise<any> => {
  const defaultSelect = {
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
  }
  return await prisma.client.customer.findFirst({
    where: { id: testCustomer.id },
    select: merge(defaultSelect, select),
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
  const doesInclude = comment.toLowerCase().includes(expectedLine.toLowerCase())
  expect(doesInclude).toBe(true)
}

const expectTimeToEqual = (time, expectedValue) => {
  if (!expectedValue) {
    expect(time).toBe(expectedValue)
  }
  expect(moment(time).format("ll")).toEqual(moment(expectedValue).format("ll"))
}
