import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import {
  PhysicalProduct,
  Prisma,
  RentalInvoiceLineItem,
  ReservationStatus,
  ShippingCode,
  ShippingOption,
} from "@prisma/client"
import chargebee from "chargebee"
import { head, merge } from "lodash"
import moment from "moment"

import { PaymentService } from "../services/payment.service"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../services/rental.service"

const BASE_PROCESSING_FEE = 550
const UPS_GROUND_FEE = 1000
const UPS_SELECT_FEE = 2000

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

enum ChargebeeMockFunction {
  SubscriptionAddChargeAtTermEnd,
  SubscriptionAddChargeAtTermEndWithError,
  InvoiceCreate,
  SubscriptionRetrieve,
}

class ChargeBeeMock {
  constructor(private readonly mockFunction: ChargebeeMockFunction) {}

  private usageLineItems = [
    {
      amount: 2300,
      date_from: 1628741509,
      date_to: 1630642309,
      tax_amount: 184,
      tax_rate: 0.08,
      description: "Some production description 1",
      is_taxed: true,
    },
    {
      amount: 3841,
      date_from: 1628741509,
      date_to: 1630642309,
      tax_amount: 307,
      tax_rate: 0.08,
      description: "Some product description 2",
      is_taxed: true,
    },
    {
      amount: 550,
      date_from: 1628741509,
      date_to: 1630642309,
      tax_amount: 44,
      tax_rate: 0.08,
      description: "Processing description",
      is_taxed: true,
    },
  ]

  async request() {
    switch (this.mockFunction) {
      case ChargebeeMockFunction.InvoiceCreate:
        return {
          invoice: {
            id: "17025",
            customer_id: "ckt3y8o150000zzuv7d7iuesr",
            recurring: false,
            status: "paid",
            total: 6632,
            amount_paid: 6632,
            tax: 491,
            line_items: this.usageLineItems,
          },
        }
      case ChargebeeMockFunction.SubscriptionAddChargeAtTermEnd:
        return {
          estimate: {
            invoice_estimate: {
              line_items: [
                ...this.usageLineItems,
                {
                  amount: 2500,
                  date_from: 1628741509,
                  date_to: 1630642309,
                  tax_rate: 0.08,
                  tax_amount: 0,
                  description: "access-monthly",
                  tax_exempt_reason: "export",
                  is_taxed: true,
                },
              ],
            },
          },
        }
      case ChargebeeMockFunction.SubscriptionAddChargeAtTermEndWithError:
        throw "test error"
      case ChargebeeMockFunction.SubscriptionRetrieve:
        return {
          customer: {},
          subscription: {
            next_billing_at: moment().add(5, "days").unix(),
          },
        }
      default:
        throw "unrecognized function call"
    }
  }
}

let prisma: PrismaService
let rentalService: RentalService
let reseveService: ReserveService
let reservationService: ReservationService
let utils: UtilsService
let timeUtils: TimeUtilsService
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
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reseveService = moduleRef.get<ReserveService>(ReserveService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)

    jest
      .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
      .mockReturnValue(
        new ChargeBeeMock(ChargebeeMockFunction.SubscriptionAddChargeAtTermEnd)
      )

    jest
      .spyOn<any, any>(chargebee.invoice, "create")
      .mockReturnValue(new ChargeBeeMock(ChargebeeMockFunction.InvoiceCreate))

    jest
      .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
      .mockReturnValue(
        new ChargeBeeMock(ChargebeeMockFunction.SubscriptionAddChargeAtTermEnd)
      )

    jest
      .spyOn<any, any>(chargebee.subscription, "retrieve")
      .mockReturnValue(
        new ChargeBeeMock(ChargebeeMockFunction.SubscriptionRetrieve)
      )
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
          twentyThreeDaysAgo = timeUtils.xDaysAgoISOString(23)
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
          expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(2))

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
          expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(4))

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
        expectTimeToEqual(rentalStartedAt, timeUtils.xDaysAgoISOString(30))
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
      let lineItemsBySUIDOrName
      let expectedResultsBySUIDOrName
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

        const initialReservationProductSUIDs = initialReservation.newProducts.map(
          a => a.seasonsUID
        )
        const reservationTwoSUIDs = reservationTwo.newProducts.map(
          b => b.seasonsUID
        )
        const reservationThreeSUIDs = reservationThree.newProducts.map(
          c => c.seasonsUID
        )

        // Override product prices so we can predict the proper price
        const custWithData = (await getCustWithData()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        invoicePhysicalProductSUIDs = rentalInvoice.products.map(
          a => a.seasonsUID
        )

        const reservationSUIDsInOrder = [
          ...initialReservationProductSUIDs,
          ...reservationTwoSUIDs,
          ...reservationThreeSUIDs,
        ]
        await overridePrices(reservationSUIDsInOrder, [30, 50, 80, 100])

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
            select: {
              physicalProduct: { select: { seasonsUID: true } },
              daysRented: true,
              rentalStartedAt: true,
              rentalEndedAt: true,
              price: true,
              taxName: true,
              taxPercentage: true,
              taxPrice: true,
              taxRate: true,
              comment: true,
              name: true,
            },
          }
        )
        lineItemsPhysicalProductSUIDs = lineItemsWithData
          .filter(a => !!a.physicalProduct)
          .map(a => a.physicalProduct.seasonsUID)

        lineItemsBySUIDOrName = createLineItemHash(lineItemsWithData)
        expectedResultsBySUIDOrName = {
          [initialReservationProductSUIDs[0]]: {
            daysRented: 23,
            rentalStartedAt: timeUtils.xDaysAgoISOString(23),
            rentalEndedAt: now,
            price: 2300,
          },
          [initialReservationProductSUIDs[1]]: {
            daysRented: 23,
            rentalStartedAt: timeUtils.xDaysAgoISOString(23),
            rentalEndedAt: now,
            price: 3841,
          },
          [reservationTwoSUIDs[0]]: {
            daysRented: 9,
            rentalStartedAt: timeUtils.xDaysAgoISOString(9),
            rentalEndedAt: now,
            price: 2403,
          },
          [reservationThreeSUIDs[0]]: {
            daysRented: 0,
            rentalStartedAt: null,
            rentalEndedAt: null,
            price: 0,
          },
          Processing: {
            // 3 reservations sent, none returned --> paying for 2 sent packages at 1000 each. 1st package is on us --> 2000
            // 3 new reservations, 3 * reservation_processing_cost (550) --> 1650
            price: 3650,
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
          expect(lineItemsBySUIDOrName[suid].daysRented).toEqual(
            expectedResultsBySUIDOrName[suid].daysRented
          )
        }
      })

      it("Stores the proper values for rentalStartedAt and rentalEndedAt", () => {
        for (const suid of invoicePhysicalProductSUIDs) {
          const testStart = lineItemsBySUIDOrName[suid]["rentalStartedAt"]
          const expectedStart =
            expectedResultsBySUIDOrName[suid].rentalStartedAt
          const testEnd = lineItemsBySUIDOrName[suid]["rentalEndedAt"]
          const expectedEnd = expectedResultsBySUIDOrName[suid].rentalEndedAt
          expectTimeToEqual(testStart, expectedStart)
          expectTimeToEqual(testEnd, expectedEnd)
        }
      })

      it("Stores the proper price for physical product line items", () => {
        for (const suid of invoicePhysicalProductSUIDs) {
          const testPrice = lineItemsBySUIDOrName[suid].price
          const expectedPrice = expectedResultsBySUIDOrName[suid].price
          expect(testPrice).toEqual(expectedPrice)
        }
      })

      /* By way of construction, this test covers the following cases
      If a reservation was created but not returned in this billing cycle, we charge the 
        base processing fee
      If there are 2 or more new reservations in this billing cycle, we charge for the 
        sent package on all but the first
      */
      it("Properly calculates the price for the processing fees line item", () => {
        expect(lineItemsBySUIDOrName["Processing"].price).toBe(
          expectedResultsBySUIDOrName["Processing"].price
        )
      })

      it("Doesn't set the taxes on them", () => {
        for (const id of [...invoicePhysicalProductSUIDs, "Processing"]) {
          expect(lineItemsBySUIDOrName[id].taxPrice).toBe(null)
          expect(lineItemsBySUIDOrName[id].taxRate).toBe(null)
          expect(lineItemsBySUIDOrName[id].taxPercentage).toBe(null)
          expect(lineItemsBySUIDOrName[id].taxName).toBe(null)
        }
      })
    })

    describe("Processing Edge cases", () => {
      beforeEach(async () => {
        const { cleanupFunc, customer } = await createTestCustomer({
          select: testCustomerSelect,
        })
        cleanupFuncs.push(cleanupFunc)
        testCustomer = customer
      })

      it("Does not charge any processing fee for a reservation created in a previous billing cycle and held throughout this billing cycle", async () => {
        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 40)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 38)
        await setReservationStatus(initialReservation.id, "Delivered")

        const custWithData = (await getCustWithData()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const processingLineItem = lineItems.find(a => a.name === "Processing")
        expect(processingLineItem.price).toBe(0)
      })

      it("Charges for the return package if a reservation was created in a previous billing cycle and returned in this one", async () => {
        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 40)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 38)
        await setReservationStatus(initialReservation.id, "Completed")

        await setPackageDeliveredAt(initialReservation.returnPackages[0].id, 10)

        const custWithData = (await getCustWithData()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const processingLineItem = lineItems.find(a => a.name === "Processing")
        expect(processingLineItem.price).toBe(UPS_GROUND_FEE)
      })

      it("Charges for the return package and base processing fee if a reservation was created and returned in this billing cycle", async () => {
        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Completed")

        await setPackageDeliveredAt(initialReservation.returnPackages[0].id, 2)

        const custWithData = (await getCustWithData()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const processingLineItem = lineItems.find(a => a.name === "Processing")
        expect(processingLineItem.price).toBe(
          BASE_PROCESSING_FEE + UPS_GROUND_FEE
        )
      })

      it("Charges for the sent package if a reservation used a premium shipping option", async () => {
        const initialReservation = await addToBagAndReserveForCustomer(2, {
          shippingCode: "UPSSelect",
        })
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Delivered")
        await setPackageAmount(
          initialReservation.sentPackage.id,
          UPS_SELECT_FEE
        )

        const custWithData = (await getCustWithData()) as any
        const rentalInvoice = custWithData.membership.rentalInvoices[0]
        const lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoice
        )

        const processingLineItem = lineItems.find(a => a.name === "Processing")
        expect(processingLineItem.price).toBe(
          BASE_PROCESSING_FEE + UPS_SELECT_FEE
        )
      })
    })
  })

  // TODO: Add case for a rental invoice with no line items
  describe("Charge customer", () => {
    let rentalInvoiceToBeBilled
    let billedRentalInvoice
    let customerRentalInvoicesAfterBilling
    let lineItems
    let initialReservationProductSUIDs

    describe("Properly charges an access-monthly customer", () => {
      let addedCharges = []
      let lineItemsWithDataAfterCharging
      let lineItemsBySUIDOrName
      let expectedResultsBySUIDOrName

      beforeAll(async () => {
        const { cleanupFunc, customer } = await createTestCustomer({
          select: testCustomerSelect,
        })
        cleanupFuncs.push(cleanupFunc)
        testCustomer = customer

        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Delivered")

        const custWithData = (await getCustWithData()) as any

        initialReservationProductSUIDs = initialReservation.products.map(
          a => a.seasonsUID
        )
        await overridePrices(initialReservationProductSUIDs, [30, 50])
        rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
          where: { id: custWithData.membership.rentalInvoices[0].id },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        })

        lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoiceToBeBilled
        )

        await setCustomerPlanType("access-monthly")
        addedCharges = await rentalService.chargeTab(
          "access-monthly",
          rentalInvoiceToBeBilled,
          lineItems
        )
        billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
          where: { id: rentalInvoiceToBeBilled.id },
          select: { id: true, status: true },
        })

        const custWithUpdatedData = (await getCustWithData({
          membership: {
            select: {
              rentalInvoices: {
                select: { status: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        })) as any
        customerRentalInvoicesAfterBilling =
          custWithUpdatedData.membership.rentalInvoices

        lineItemsWithDataAfterCharging = await prisma.client.rentalInvoiceLineItem.findMany(
          {
            where: { id: { in: lineItems.map(a => a.id) } },
            select: {
              taxPrice: true,
              taxRate: true,
              physicalProduct: { select: { seasonsUID: true } },
              name: true,
            },
          }
        )

        lineItemsBySUIDOrName = createLineItemHash(
          lineItemsWithDataAfterCharging
        )
        expectedResultsBySUIDOrName = {
          [initialReservationProductSUIDs[0]]: {
            taxPrice: 184,
            taxRate: 0.08,
          },
          [initialReservationProductSUIDs[1]]: {
            taxPrice: 307,
            taxRate: 0.08,
          },
          Processing: {
            taxPrice: 44,
            taxRate: 0.08,
          },
        }
      })

      it("Creates a charge for each line item", () => {
        expect(addedCharges.length).toBe(3)
      })

      it("Marks their current rental invoice as billed", () => {
        expect(billedRentalInvoice.status).toBe("Billed")
      })

      it("Initializes their next rental invoice", () => {
        expect(customerRentalInvoicesAfterBilling.length).toBe(2)
        expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
        expect(customerRentalInvoicesAfterBilling[1].status).toBe("Billed")
      })

      it("Adds taxes to the line items", () => {
        for (const id of [...initialReservationProductSUIDs, "Processing"]) {
          expect(lineItemsBySUIDOrName[id].taxPrice).toEqual(
            expectedResultsBySUIDOrName[id].taxPrice
          )
          expect(lineItemsBySUIDOrName[id].taxRate).toEqual(
            expectedResultsBySUIDOrName[id].taxRate
          )
        }
      })
    })

    describe("Properly charges an access-annual customer", () => {
      let addedCharges
      let lineItemsWithDataAfterCharging
      let lineItemsBySUIDOrName
      let expectedResultsBySUIDOrName

      beforeAll(async () => {
        const { cleanupFunc, customer } = await createTestCustomer({
          select: testCustomerSelect,
        })
        cleanupFuncs.push(cleanupFunc)
        testCustomer = customer

        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Delivered")

        // Override product prices so we can predict the proper price
        const custWithData = (await getCustWithData()) as any

        initialReservationProductSUIDs = initialReservation.products.map(
          a => a.seasonsUID
        )
        await overridePrices(initialReservationProductSUIDs, [30, 50])
        rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
          where: { id: custWithData.membership.rentalInvoices[0].id },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        })

        lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoiceToBeBilled
        )

        await setCustomerPlanType("access-yearly")
        addedCharges = await rentalService.chargeTab(
          "access-yearly",
          rentalInvoiceToBeBilled,
          lineItems
        )

        billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
          where: { id: rentalInvoiceToBeBilled.id },
          select: { id: true, status: true },
        })

        const custWithUpdatedData = (await getCustWithData({
          membership: {
            select: {
              rentalInvoices: {
                select: { status: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        })) as any
        customerRentalInvoicesAfterBilling =
          custWithUpdatedData.membership.rentalInvoices

        lineItemsWithDataAfterCharging = await prisma.client.rentalInvoiceLineItem.findMany(
          {
            where: { id: { in: lineItems.map(a => a.id) } },
            select: {
              taxPrice: true,
              taxRate: true,
              physicalProduct: { select: { seasonsUID: true } },
              name: true,
            },
          }
        )

        lineItemsBySUIDOrName = createLineItemHash(
          lineItemsWithDataAfterCharging
        )
        expectedResultsBySUIDOrName = {
          [initialReservationProductSUIDs[0]]: {
            taxPrice: 184,
            taxRate: 0.08,
          },
          [initialReservationProductSUIDs[1]]: {
            taxPrice: 307,
            taxRate: 0.08,
          },
          Processing: { taxPrice: 44, taxRate: 0.08 },
        }
      })

      it("Creates a single chargebee invoice for the whole RentalInvoice", () => {
        expect(addedCharges.length).toBe(1)
      })

      it("Marks their current rental invoice as billed", () => {
        expect(billedRentalInvoice.status).toBe("Billed")
      })

      it("Initializes their next rental invoice", () => {
        expect(customerRentalInvoicesAfterBilling.length).toBe(2)
        expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
        expect(customerRentalInvoicesAfterBilling[1].status).toBe("Billed")
      })

      it("Adds taxes to the line items", () => {
        for (const id of [...initialReservationProductSUIDs, "Processing"]) {
          expect(lineItemsBySUIDOrName[id].taxPrice).toEqual(
            expectedResultsBySUIDOrName[id].taxPrice
          )
          expect(lineItemsBySUIDOrName[id].taxRate).toEqual(
            expectedResultsBySUIDOrName[id].taxRate
          )
        }
      })
    })

    describe("Properly handles an error", () => {
      beforeAll(async () => {
        jest
          .spyOn<any, any>(chargebee.subscription, "add_charge_at_term_end")
          .mockReturnValue(
            new ChargeBeeMock(
              ChargebeeMockFunction.SubscriptionAddChargeAtTermEndWithError
            )
          )

        const { cleanupFunc, customer } = await createTestCustomer({
          select: testCustomerSelect,
        })
        cleanupFuncs.push(cleanupFunc)
        testCustomer = customer

        const initialReservation = await addToBagAndReserveForCustomer(2)
        await setReservationCreatedAt(initialReservation.id, 25)
        await setPackageDeliveredAt(initialReservation.sentPackage.id, 23)
        await setReservationStatus(initialReservation.id, "Delivered")

        const custWithData = (await getCustWithData()) as any

        rentalInvoiceToBeBilled = await prisma.client.rentalInvoice.findUnique({
          where: { id: custWithData.membership.rentalInvoices[0].id },
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        })
        lineItems = await rentalService.createRentalInvoiceLineItems(
          rentalInvoiceToBeBilled
        )

        await setCustomerPlanType("access-monthly")
        await rentalService.chargeTab(
          "access-monthly",
          rentalInvoiceToBeBilled,
          lineItems
        )

        billedRentalInvoice = await prisma.client.rentalInvoice.findUnique({
          where: { id: rentalInvoiceToBeBilled.id },
          select: { id: true, status: true },
        })

        const custWithUpdatedData = (await getCustWithData({
          membership: {
            select: {
              rentalInvoices: {
                select: { status: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        })) as any
        customerRentalInvoicesAfterBilling =
          custWithUpdatedData.membership.rentalInvoices
      })

      it("Marks the current rental invoice as ChargeFailed", () => {
        expect(billedRentalInvoice.status).toBe("ChargeFailed")
      })

      it("Initializes their next rental invoice", () => {
        expect(customerRentalInvoicesAfterBilling.length).toBe(2)
        expect(customerRentalInvoicesAfterBilling[0].status).toBe("Draft")
        expect(customerRentalInvoicesAfterBilling[1].status).toBe(
          "ChargeFailed"
        )
      })
    })
  })

  describe("Initialize rental invoice", () => {
    /*
    Creates it correctly the first time around
      no reservations
      no products
      proper membership, billing start at, billing end at

    Creates it correctly when the customer has a complex reservation history
      only reserved bag items for physical products
      only active reservations get carried over
      proper membership, billing start at, billing end at



    */
  })

  /*
  TODO: Update this test suite for the following cases:

  If we're creating the customer's initial rental invoice
    AND they are access-monthly:
      -> query chargebee, get next billing at, and return 1 day before that
    AND they are access-yearly,
      -> do 30 days from the start date, adjusted for month length
  If we're creating the customer's 2nd or later rental invoice:
    AND they are access-monthly:
      -> do 30 days from the start date, adjusted for month length
    AND they are access-yearly:
      -> do 30 days from the start date, adjusted for month length
  */
  describe("GetRentalInvoiceBillingEndAt", () => {
    let rentalInvoiceBillingEndAt: Date
    let custWithData

    beforeAll(async () => {
      const { cleanupFunc, customer } = await createTestCustomer({
        select: testCustomerSelect,
      })
      cleanupFuncs.push(cleanupFunc)
      testCustomer = customer
    })

    describe("Access Monthly Customers", () => {
      beforeAll(async () => {
        await setCustomerPlanType("access-monthly")
        custWithData = (await getCustWithData({
          membership: {
            select: {
              id: true,
            },
          },
        })) as any
      })

      it("queries chargebee and uses next_billing_at (minus 1)", async () => {
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          null
        )
        expect(rentalInvoiceBillingEndAt).toBe(
          timeUtils.xDaysFromNowISOString(4)
        )
      })
    })

    describe("Access Annual Customers", () => {
      beforeAll(async () => {
        await setCustomerPlanType("access-yearly")
        custWithData = (await getCustWithData({
          membership: {
            select: {
              id: true,
            },
          },
        })) as any
      })

      it("If the next month has the start date's date, it uses that", async () => {
        const februarySeventh2021 = new Date(2021, 1, 7)
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          februarySeventh2021
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 2, 7))
      })

      it("If the start date is the 31st and the next month only has 30 days, it uses 30", async () => {
        const marchThirtyFirst2021 = new Date(2021, 2, 31)
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          marchThirtyFirst2021
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 3, 30))
      })

      it("If the start date is 30 and the next month is February in a non leap year, it uses the 28th", async () => {
        const januaryThirty2021 = new Date(2021, 0, 30)
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          januaryThirty2021
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2021, 1, 28))
      })

      it("If the start date is 30 and the next month is February in a leap year, it uses the 29th", async () => {
        const januaryThirty2024 = new Date(2024, 0, 30)
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          januaryThirty2024
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2024, 1, 29))
      })

      it("If the start date is 29 and the next month is February in a leap year, it uses the 29th", async () => {
        const januaryTwentyNine2024 = new Date(2024, 0, 29)
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          januaryTwentyNine2024
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2024, 1, 29))
      })

      it("If the start date is in december, it creates the billing end at date in the following year", async () => {
        const decemberThirtyOne2021 = new Date(2021, 11, 31)
        rentalInvoiceBillingEndAt = await rentalService.getRentalInvoiceBillingEndAt(
          custWithData.membership.id,
          decemberThirtyOne2021
        )
        expectTimeToEqual(rentalInvoiceBillingEndAt, new Date(2022, 0, 31))
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
  const upsSelectMethod = await prisma.client.shippingMethod.findFirst({
    where: { code: "UPSSelect" },
  })
  const chargebeeSubscriptionId = utils.randomString()
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
              create: [
                {
                  shippingMethod: { connect: { id: upsGroundMethod.id } },
                  externalCost: 10,
                },
                {
                  shippingMethod: { connect: { id: upsSelectMethod.id } },
                  externalCost: 20,
                },
              ],
            },
          },
        },
      },
    },
    membership: {
      create: {
        subscriptionId: chargebeeSubscriptionId,
        plan: { connect: { planID: "access-monthly" } },
        rentalInvoices: {
          create: {
            billingStartAt: timeUtils.xDaysAgoISOString(30),
            billingEndAt: new Date(),
          },
        },
        subscription: {
          create: {
            planID: "access-monthly",
            subscriptionId: chargebeeSubscriptionId,
            currentTermStart: timeUtils.xDaysAgoISOString(1),
            currentTermEnd: timeUtils.xDaysFromNowISOString(1),
            nextBillingAt: timeUtils.xDaysFromNowISOString(1),
            status: "Active",
            planPrice: 2000,
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

const setCustomerPlanType = async (
  planID: "access-monthly" | "access-yearly"
) => {
  await prisma.client.customer.update({
    where: { id: testCustomer.id },
    data: { membership: { update: { plan: { connect: { planID } } } } },
  })
}

const addToBagAndReserveForCustomer = async (
  numProductsToAdd,
  options: { shippingCode?: ShippingCode } = {}
) => {
  const { shippingCode = null } = options
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
  let reservableProdVars = []
  let reservableProductIds = []
  for (let i = 0; i < numProductsToAdd; i++) {
    const nextProdVar = await prisma.client.productVariant.findFirst({
      where: {
        reservable: { gte: 1 },
        sku: { notIn: reservedSKUs },
        // Ensure we reserve diff products each time. Needed for some tests
        product: {
          id: { notIn: [...reservedProductIds, ...reservableProductIds] },
        },
        // We shouldn't need to check this since we're checking counts,
        // but there's some corrupt data so we do this to circumvent that.
        physicalProducts: { some: { inventoryStatus: "Reservable" } },
      },
      take: numProductsToAdd,
      select: {
        id: true,
        productId: true,
      },
    })
    reservableProdVars.push(nextProdVar)
    reservableProductIds.push(nextProdVar.productId)
  }
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
  const r = await reseveService.reserveItems(
    shippingCode,
    testCustomer as any,
    {
      reservationNumber: true,
      products: { select: { seasonsUID: true } },
      newProducts: { select: { seasonsUID: true } },
      sentPackage: { select: { id: true } },
      returnPackages: {
        select: {
          id: true,
          shippingLabel: { select: { trackingNumber: true } },
        },
      },
    }
  )
  await setPackageAmount(r.sentPackage.id, UPS_GROUND_FEE)
  await setPackageAmount(r.returnPackages[0].id, UPS_GROUND_FEE)
  return r
}

const setPackageDeliveredAt = async (packageId, numDaysAgo) => {
  const eighteenDaysAgo = timeUtils.xDaysAgoISOString(numDaysAgo)
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
  const date = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.reservation.update({
    where: { id: reservationId },
    data: { createdAt: date },
  })
}

const setPackageEnteredSystemAt = async (packageId, numDaysAgo) => {
  const date = timeUtils.xDaysAgoISOString(numDaysAgo)
  await prisma.client.package.update({
    where: { id: packageId },
    data: { enteredDeliverySystemAt: date },
  })
}

const setPackageAmount = async (packageId, amount) => {
  await prisma.client.package.update({
    where: { id: packageId },
    data: { amount },
  })
}

const getCustWithData = async (
  select: Prisma.CustomerSelect = {}
): Promise<any> => {
  const defaultSelect = {
    membership: {
      select: {
        rentalInvoices: {
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
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

const overridePrices = async (seasonsUIDs, prices) => {
  if (seasonsUIDs.length !== prices.length) {
    throw "must pass in same length arrays"
  }
  for (const [i, overridePrice] of prices.entries()) {
    const prodToUpdate = await prisma.client.product.findFirst({
      where: {
        variants: {
          some: {
            physicalProducts: {
              some: { seasonsUID: seasonsUIDs[i] },
            },
          },
        },
      },
    })
    await prisma.client.product.update({
      where: { id: prodToUpdate.id },
      data: { computedRentalPrice: overridePrice },
    })
  }
}

const createLineItemHash = (
  items: (Pick<RentalInvoiceLineItem, "name"> & {
    physicalProduct: Pick<PhysicalProduct, "seasonsUID">
  })[]
) =>
  items.reduce((acc, curVal) => {
    return {
      ...acc,
      [curVal.physicalProduct?.seasonsUID || curVal.name]: curVal,
    }
  }, {})
