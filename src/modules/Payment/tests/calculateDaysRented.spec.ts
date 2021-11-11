import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { head } from "lodash"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import {
  ProcessableReservationPhysicalProductSelect,
  RentalService,
} from "../services/rental.service"
import {
  TestReservation,
  addToBagAndReserveForCustomer,
  expectTimeToEqual,
  getCustWithData,
  getReservationPhysicalProductWithData,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationPhysicalProductDeliveredToBusinessAt,
  setReservationPhysicalProductDeliveredToCustomerAt,
  setReservationPhysicalProductDroppedOffAt,
  setReservationPhysicalProductReturnProcessedAt,
  setReservationPhysicalProductScannedOnInboundAt,
  setReservationPhysicalProductStatus,
  setReservationStatus,
} from "./utils/utils"

describe("Calculate Days Rented", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let reserveService: ReserveService

  let addToBagAndReserveForCustomerWithParams
  let getCustWithDataWithParams
  let setReservationPhysicalProductDeliveredToCustomerAtWithParams
  let setReservationPhysicalProductStatusWithParams
  let getReservationPhysicalProductWithDataWithParams
  let setReservationPhysicalProductDeliveredToBusinessAtWithParams
  let setReservationPhysicalProductScannedOnInboundAtWithParams
  let setReservationPhysicalProductReturnProcessedAtWithParams
  let setReservationPhysicalProductDroppedOffAtWithParams

  let testCustomer

  const now = new Date()

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)

    addToBagAndReserveForCustomerWithParams = (numBagItems, { numDaysAgo }) =>
      addToBagAndReserveForCustomer(
        testCustomer,
        numBagItems,
        {
          prisma,
          reserveService,
          timeUtils,
        },
        { numDaysAgo }
      )
    getCustWithDataWithParams = () =>
      getCustWithData(testCustomer, {
        prisma,
        select: {},
      })
    setReservationPhysicalProductDeliveredToCustomerAtWithParams = (
      reservationPhysicalProductId,
      deliveredAt
    ) =>
      setReservationPhysicalProductDeliveredToCustomerAt(
        reservationPhysicalProductId,
        deliveredAt,
        { prisma, timeUtils }
      )
    setReservationPhysicalProductStatusWithParams = (
      reservationPhysicalProductId,
      status
    ) =>
      setReservationPhysicalProductStatus(
        reservationPhysicalProductId,
        status,
        { prisma }
      )
    getReservationPhysicalProductWithDataWithParams = reservationPhysicalProductId =>
      getReservationPhysicalProductWithData(reservationPhysicalProductId, {
        prisma,
      })
    setReservationPhysicalProductDeliveredToBusinessAtWithParams = (
      reservationPhysicalProductId,
      numDaysAgo
    ) =>
      setReservationPhysicalProductDeliveredToBusinessAt(
        reservationPhysicalProductId,
        numDaysAgo,
        { prisma, timeUtils }
      )
    setReservationPhysicalProductScannedOnInboundAtWithParams = (
      reservationPhysicalProductId,
      numDaysAgo
    ) =>
      setReservationPhysicalProductScannedOnInboundAt(
        reservationPhysicalProductId,
        numDaysAgo,
        { prisma, timeUtils }
      )
    setReservationPhysicalProductReturnProcessedAtWithParams = (
      reservationPhysicalProductId,
      numDaysAgo
    ) =>
      setReservationPhysicalProductReturnProcessedAt(
        reservationPhysicalProductId,
        numDaysAgo,
        { prisma, timeUtils }
      )
    setReservationPhysicalProductDroppedOffAtWithParams = (
      reservationPhysicalProductId,
      numDaysAgo,
      agent
    ) =>
      setReservationPhysicalProductDroppedOffAt(
        reservationPhysicalProductId,
        numDaysAgo,
        agent,
        { prisma, timeUtils }
      )
    // reservationService = moduleRef.get<ReservationService>(ReservationService)
  })

  beforeEach(async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: {
        id: true,
        membership: { select: { rentalInvoices: { select: { id: true } } } },
      },
    })
    testCustomer = customer
  })

  describe("Items reserved in this billing cycle", () => {
    let initialReservation
    let reservationPhysicalProductWithData
    let twentyThreeDaysAgo

    beforeAll(() => {
      twentyThreeDaysAgo = timeUtils.xDaysAgoISOString(23)
    })

    it("Reserved and held", async () => {
      initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
        numDaysAgo: 25,
      })
      const reservationPhysicalProduct =
        initialReservation.reservationPhysicalProducts[0]
      await setReservationPhysicalProductDeliveredToCustomerAtWithParams(
        reservationPhysicalProduct.id,
        23
      )
      await setReservationPhysicalProductStatusWithParams(
        reservationPhysicalProduct.id,
        "DeliveredToCustomer"
      )

      reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
        reservationPhysicalProduct.id
      )
      const {
        daysRented,
        comment,
        rentalEndedAt,
        rentalStartedAt,
      } = await rentalService.calcDaysRented(
        testCustomer.membership.rentalInvoices[0],
        reservationPhysicalProductWithData
      )

      expect(daysRented).toBe(23)
      expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
      expectTimeToEqual(rentalEndedAt, now)
      expect(comment).toBe("") // TODO:
    })

    it("Reserved and shipped back", async () => {
      const nineDaysAgo = timeUtils.xDaysAgoISOString(9)

      initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
        numDaysAgo: 25,
      })
      const reservationPhysicalProduct =
        initialReservation.reservationPhysicalProducts[0]
      await setReservationPhysicalProductDeliveredToCustomerAtWithParams(
        reservationPhysicalProduct.id,
        23
      )

      // Make the data look like it's been delivered back and had a return processed
      await setReservationPhysicalProductScannedOnInboundAtWithParams(
        reservationPhysicalProduct.id,
        9
      )
      await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
        reservationPhysicalProduct.id,
        7
      )
      await setReservationPhysicalProductReturnProcessedAtWithParams(
        reservationPhysicalProduct.id,
        7
      )
      await setReservationPhysicalProductDroppedOffAtWithParams(
        reservationPhysicalProduct.id,
        7,
        "UPS"
      )
      await setReservationPhysicalProductStatusWithParams(
        reservationPhysicalProduct.id,
        "ReturnProcessed"
      )

      reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
        reservationPhysicalProduct.id
      )
      const {
        daysRented,
        comment,
        rentalEndedAt,
        rentalStartedAt,
      } = await rentalService.calcDaysRented(
        testCustomer.membership.rentalInvoices[0],
        reservationPhysicalProductWithData
      )

      expect(daysRented).toBe(14)
      expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
      expectTimeToEqual(rentalEndedAt, nineDaysAgo)
      expect(comment).toBe("") // TODO:
    })

    it("Reserved and returned with customer dropping off", async () => {
      const twoDaysAgo = timeUtils.xDaysAgoISOString(2)

      initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
        numDaysAgo: 25,
      })
      const reservationPhysicalProduct =
        initialReservation.reservationPhysicalProducts[0]
      await setReservationPhysicalProductDeliveredToCustomerAtWithParams(
        reservationPhysicalProduct.id,
        23
      )

      // Make the data look like it's been dropped off by the customer and had a return processed
      await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
        reservationPhysicalProduct.id,
        2
      )
      await setReservationPhysicalProductReturnProcessedAtWithParams(
        reservationPhysicalProduct.id,
        2
      )
      await setReservationPhysicalProductDroppedOffAtWithParams(
        reservationPhysicalProduct.id,
        2,
        "Customer"
      )
      await setReservationPhysicalProductStatusWithParams(
        reservationPhysicalProduct.id,
        "ReturnProcessed"
      )

      reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
        reservationPhysicalProduct.id
      )
      const {
        daysRented,
        comment,
        rentalEndedAt,
        rentalStartedAt,
      } = await rentalService.calcDaysRented(
        testCustomer.membership.rentalInvoices[0],
        reservationPhysicalProductWithData
      )

      expect(daysRented).toBe(21)
      expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
      expectTimeToEqual(rentalEndedAt, twoDaysAgo)
      expect(comment).toBe("") // TODO:
    })
  })
})
