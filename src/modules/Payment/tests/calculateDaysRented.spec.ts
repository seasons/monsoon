import { APP_MODULE_DEF } from "@app/app.module"
import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { head } from "lodash"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"
import {
  TestReservation,
  addToBagAndReserveForCustomer,
  expectTimeToEqual,
  getCustWithData,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "./utils/utils"

describe("Calculate Days Rented", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let reservationService: ReservationService
  let reserveService: ReserveService
  let addToBagAndReserveForCustomerWithParams
  let setReservationCreatedAtWithParams
  let setPackageDeliveredAtWithParams
  let setReservationStatusWithParams
  let setPackageEnteredSystemAtWithParams
  let testCustomer
  let getCustWithDataWithParams
  const now = new Date()

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)

    setReservationCreatedAtWithParams = (reservationId, numDaysAgo) =>
      setReservationCreatedAt(reservationId, numDaysAgo, {
        prisma,
        timeUtils,
      })
    setPackageDeliveredAtWithParams = (packageId, numDaysAgo) =>
      setPackageDeliveredAt(packageId, numDaysAgo, { prisma, timeUtils })
    setReservationStatusWithParams = (reservationId, status) =>
      setReservationStatus(reservationId, status, { prisma })
    setPackageEnteredSystemAtWithParams = (packageId, numDaysAgo) =>
      setPackageEnteredSystemAt(packageId, numDaysAgo, { prisma, timeUtils })
  })

  beforeEach(async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: { id: true },
    })
    testCustomer = customer
    addToBagAndReserveForCustomerWithParams = numBagItems =>
      addToBagAndReserveForCustomer(testCustomer, numBagItems, {
        prisma,
        reserveService,
      })
    getCustWithDataWithParams = () =>
      getCustWithData(testCustomer, {
        prisma,
        select: {},
      })
  })

  describe("Items reserved in this billing cycle", () => {
    describe("Core flows", () => {
      let initialReservation: TestReservation
      let custWithData: any
      let twentyThreeDaysAgo

      beforeEach(async () => {
        initialReservation = await addToBagAndReserveForCustomerWithParams(1)
        await setReservationCreatedAtWithParams(initialReservation.id, 25)
        await setPackageDeliveredAtWithParams(
          initialReservation.sentPackage.id,
          23
        )
        await setReservationStatusWithParams(initialReservation.id, "Delivered")
        custWithData = await getCustWithDataWithParams()
        twentyThreeDaysAgo = timeUtils.xDaysAgoISOString(23)
      })

      it("reserved and returned on same reservation", async () => {
        // process the return
        const returnPackage = head(initialReservation.returnPackages)
        await setPackageEnteredSystemAtWithParams(returnPackage.id, 2)
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
        const reservationTwo = (await addToBagAndReserveForCustomerWithParams(
          1
        )) as any
        await setReservationStatusWithParams(reservationTwo.id, "Delivered")
        const reservationThree = (await addToBagAndReserveForCustomerWithParams(
          3
        )) as any
        await setReservationStatusWithParams(reservationThree.id, "Delivered")

        // Return it with the label from the last reservation
        const returnPackage = head(reservationThree.returnPackages)
        await setPackageEnteredSystemAtWithParams(returnPackage.id, 4)
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
          "returnpending"
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
        const reservationTwo = (await addToBagAndReserveForCustomerWithParams(
          2
        )) as any
        await setReservationStatusWithParams(reservationTwo.id, "Delivered")
        const reservationThree = (await addToBagAndReserveForCustomerWithParams(
          1
        )) as any
        await setReservationStatusWithParams(reservationThree.id, "Delivered")

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
          "returnpending"
        )
        expectCommentToInclude(comment, "item status: with customer")
      })
    })

    describe("Reservation in processing", () => {
      let initialReservation: any
      let custWithData: any

      beforeEach(async () => {
        initialReservation = await addToBagAndReserveForCustomerWithParams(1)
        custWithData = await getCustWithDataWithParams()
      })

      it("Sent on a Queued reservation", async () => {
        setReservationStatusWithParams(initialReservation.id, "Queued")

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
        setReservationStatusWithParams(initialReservation.id, "Picked")

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
        setReservationStatusWithParams(initialReservation.id, "Packed")

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
        setReservationStatusWithParams(initialReservation.id, "Unknown")

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
        setReservationStatusWithParams(initialReservation.id, "Blocked")

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
        setReservationStatusWithParams(initialReservation.id, "Hold")

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
      let initialReservation = (await addToBagAndReserveForCustomerWithParams(
        1
      )) as any
      let custWithData = await getCustWithDataWithParams()
      setReservationStatusWithParams(initialReservation.id, "Shipped")

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

    // it("Shipped, on the way back", async () => {
    //   // Shipped, on the way back: rentalEndedAt function of whether or not package in system.
    //   expect(0).toBe(1)
    // })

    it("lost on the way there", async () => {
      // Simulate a package getting lost en route to the customer
      let initialReservation = (await addToBagAndReserveForCustomerWithParams(
        1
      )) as any
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await prisma.client.reservation.update({
        where: { id: initialReservation.id },
        data: { status: "Shipped" },
      })
      await reservationService.updateReservation(
        { status: "Lost" },
        { id: initialReservation.id },
        {}
      )

      const custWithData = await getCustWithDataWithParams()
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
      expectCommentToInclude(comment, "item status: lost en route to customer")
    })

    // it("lost on the way back", async () => {
    //   expect(0).toBe(1)
    // })

    it("sent on a Cancelled reservation", async () => {
      // Simulate a package getting Cancelled by Ops
      let initialReservation = (await addToBagAndReserveForCustomerWithParams(
        1
      )) as any
      await setReservationCreatedAtWithParams(initialReservation.id, 25)
      await reservationService.updateReservation(
        { status: "Cancelled" },
        { id: initialReservation.id },
        {}
      )

      const custWithData = await getCustWithDataWithParams()
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
      let initialReservation = (await addToBagAndReserveForCustomerWithParams(
        1
      )) as any
      await setReservationCreatedAtWithParams(initialReservation.id, 45)
      await setReservationStatusWithParams(initialReservation.id, "Delivered")
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        44
      )

      const custWithData = await getCustWithDataWithParams()
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
