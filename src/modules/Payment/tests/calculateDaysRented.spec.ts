import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
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
  setReservationPhysicalProductDeliveredToCustomerAt,
  setReservationPhysicalProductStatus,
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
  let getCustWithDataWithParams
  let setReservationPhysicalProductDeliveredToCustomerAtWithParams
  let setReservationPhysicalProductStatusWithParams

  let testCustomer

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)

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
    // reservationService = moduleRef.get<ReservationService>(ReservationService)
  })

  beforeEach(async () => {
    const { customer } = await testUtils.createTestCustomer({
      select: { id: true },
    })
    testCustomer = customer
  })

  describe("Items reserved in this billing cycle", () => {
    let initialReservation
    let custWithData
    it("Reserved and held", async () => {
      const twentyThreeDaysAgo = timeUtils.xDaysAgoISOString(23)
      const now = new Date()

      initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
        numDaysAgo: 25,
      })
      const product = initialReservation.reservationPhysicalProducts[0]
      await setReservationPhysicalProductDeliveredToCustomerAtWithParams(
        product.id,
        23
      )
      await setReservationPhysicalProductStatusWithParams(
        product.id,
        "DeliveredToCustomer"
      )

      custWithData = await getCustWithDataWithParams()
      const {
        daysRented,
        comment,
        rentalEndedAt,
        rentalStartedAt,
      } = await rentalService.calcDaysRented(
        custWithData.membership.rentalInvoices[0],
        product
      )

      expect(daysRented).toBe(23)
      expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
      expectTimeToEqual(rentalEndedAt, now)
      expect(comment).toBe("") // TODO:
    })
  })
})
