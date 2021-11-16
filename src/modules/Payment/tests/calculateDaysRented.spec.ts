import { APP_MODULE_DEF } from "@app/app.module"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { RentalService } from "../services/rental.service"
import {
  expectTimeToEqual,
  getCustWithData,
  getReservationPhysicalProductWithData,
  setReservationPhysicalProductDeliveredToBusinessAt,
  setReservationPhysicalProductDeliveredToCustomerAt,
  setReservationPhysicalProductDroppedOffAt,
  setReservationPhysicalProductReturnProcessedAt,
  setReservationPhysicalProductScannedOnInboundAt,
  setReservationPhysicalProductScannedOnOutboundAt,
  setReservationPhysicalProductStatus,
} from "./utils/utils"

describe("Calculate Days Rented", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let reserveService: ReserveService
  let reservationTestUtils: ReservationTestUtilsService

  let addToBagAndReserveForCustomerWithParams
  let getCustWithDataWithParams
  let setReservationPhysicalProductDeliveredToCustomerAtWithParams
  let setReservationPhysicalProductStatusWithParams
  let getReservationPhysicalProductWithDataWithParams
  let setReservationPhysicalProductDeliveredToBusinessAtWithParams
  let setReservationPhysicalProductScannedOnInboundAtWithParams
  let setReservationPhysicalProductReturnProcessedAtWithParams
  let setReservationPhysicalProductDroppedOffAtWithParams
  let setReservationPhysicalProductScannedOnOutboundAtWithParams

  let testCustomer

  const now = new Date()

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )

    setReservationPhysicalProductScannedOnOutboundAtWithParams = (
      reservationPhysicalProductId,
      numDaysAgo
    ) =>
      setReservationPhysicalProductScannedOnOutboundAt(
        reservationPhysicalProductId,
        numDaysAgo,
        { prisma, timeUtils }
      )
    addToBagAndReserveForCustomerWithParams = async (
      numBagItems,
      { numDaysAgo }
    ) => {
      const {
        reservation,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: numBagItems,
        options: { numDaysAgo },
      })
      return reservation
    }
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
    let reservationPhysicalProductAfterReservation
    let twentyThreeDaysAgo

    beforeAll(() => {
      twentyThreeDaysAgo = timeUtils.xDaysAgoISOString(23)
    })

    describe("Lost", () => {
      it("Was lost on the way to the customer", async () => {
        initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
          numDaysAgo: 23,
        })
        reservationPhysicalProductAfterReservation =
          initialReservation.reservationPhysicalProducts[0]
        await prisma.client.reservationPhysicalProduct.update({
          where: { id: reservationPhysicalProductAfterReservation.id },
          data: {
            status: "Lost",
            lostAt: timeUtils.xDaysAgoISOString(18),
            hasBeenLost: true,
            lostInPhase: "BusinessToCustomer",
          },
        })
        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          initialReservation.reservationPhysicalProducts[0].id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBeUndefined()
        expect(rentalEndedAt).toBeUndefined()
        expect(comment).toBe("") // TODO:
      })

      it("Was lost on the way to us", async () => {
        initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
          numDaysAgo: 23,
        })
        reservationPhysicalProductAfterReservation =
          initialReservation.reservationPhysicalProducts[0]
        await setReservationPhysicalProductScannedOnOutboundAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          23
        )
        await setReservationPhysicalProductDeliveredToCustomerAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          22
        )

        await prisma.client.reservationPhysicalProduct.update({
          where: { id: reservationPhysicalProductAfterReservation.id },
          data: {
            status: "Lost",
            lostAt: timeUtils.xDaysAgoISOString(5),
            hasBeenLost: true,
            lostInPhase: "CustomerToBusiness",
          },
        })
        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          initialReservation.reservationPhysicalProducts[0].id
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
        expectTimeToEqual(rentalStartedAt, timeUtils.xDaysAgoISOString(22))
        expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(8))
        expect(comment).toBe("") // TODO:
      })
    })
    describe("Reached customer", () => {
      beforeEach(async () => {
        initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
          numDaysAgo: 25,
        })
        reservationPhysicalProductAfterReservation =
          initialReservation.reservationPhysicalProducts[0]
        await setReservationPhysicalProductDeliveredToCustomerAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          23
        )
      })

      it("Held", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "DeliveredToCustomer"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

      it("Shipped back (aka UPS Dropoff)", async () => {
        const nineDaysAgo = timeUtils.xDaysAgoISOString(9)

        // Make the data look like it's been delivered back and had a return processed
        await setReservationPhysicalProductScannedOnInboundAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          9
        )
        await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          7
        )
        await setReservationPhysicalProductReturnProcessedAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          7
        )
        await setReservationPhysicalProductDroppedOffAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          7,
          "UPS"
        )
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "ReturnProcessed"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

      it("Returned with customer dropping off", async () => {
        const twoDaysAgo = timeUtils.xDaysAgoISOString(2)

        // Make the data look like it's been dropped off by the customer and had a return processed
        await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          2
        )
        await setReservationPhysicalProductReturnProcessedAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          2
        )
        await setReservationPhysicalProductDroppedOffAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          2,
          "Customer"
        )
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "ReturnProcessed"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

      it("Returned with missing dropoff, scannedOnInbound timestamps", async () => {
        const eightDaysAgo = timeUtils.xDaysAgoISOString(8)

        // Fake the data
        await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          5
        )
        await setReservationPhysicalProductReturnProcessedAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          5
        )
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "ReturnProcessed"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(15) // received 23 days ago, processed 5 days ago == 18 days. 3 day cushion = 15.
        expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
        expectTimeToEqual(rentalEndedAt, eightDaysAgo)
        expect(comment).toBe("") // TODO:
      })

      it("Returned with missing dropoff, scannedOnInbound, deliveredToBusinessAt timestamp", async () => {
        const fourDaysAgo = timeUtils.xDaysAgoISOString(4)

        // Fake the data
        await setReservationPhysicalProductReturnProcessedAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          1
        )
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "ReturnProcessed"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(19) // received 23 days ago, processed 1 days ago == 22 days. 3 day cushion = 19.
        expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
        expectTimeToEqual(rentalEndedAt, fourDaysAgo)
        expect(comment).toBe("") // TODO:
      })

      describe("On the way back", () => {
        it("ScannedOnInbound at time of billing", async () => {
          // Fake the data
          await setReservationPhysicalProductScannedOnInboundAtWithParams(
            reservationPhysicalProductAfterReservation.id,
            0
          )
          await setReservationPhysicalProductStatusWithParams(
            reservationPhysicalProductAfterReservation.id,
            "ScannedOnInbound"
          )

          reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
            reservationPhysicalProductAfterReservation.id
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

        it("InTransitInbound at time of billing", async () => {
          // Fake the data
          await setReservationPhysicalProductScannedOnInboundAtWithParams(
            reservationPhysicalProductAfterReservation.id,
            1
          )
          await setReservationPhysicalProductStatusWithParams(
            reservationPhysicalProductAfterReservation.id,
            "InTransitInbound"
          )

          reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
            reservationPhysicalProductAfterReservation.id
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

          expect(daysRented).toBe(22)
          expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
          expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(1))
          expect(comment).toBe("") // TODO:
        })

        it("DeliveredToBusiness at time of billing", async () => {
          // Fake the data
          await setReservationPhysicalProductScannedOnInboundAtWithParams(
            reservationPhysicalProductAfterReservation.id,
            2
          )
          await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
            reservationPhysicalProductAfterReservation.id,
            1
          )
          await setReservationPhysicalProductStatusWithParams(
            reservationPhysicalProductAfterReservation.id,
            "DeliveredToBusiness"
          )

          reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
            reservationPhysicalProductAfterReservation.id
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
          expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(2))
          expect(comment).toBe("") // TODO:
        })

        it("DeliveredToBusiness at time of billing, missing scannedOnInboundAt", async () => {
          // Fake the data
          await setReservationPhysicalProductDeliveredToBusinessAtWithParams(
            reservationPhysicalProductAfterReservation.id,
            1
          )
          await setReservationPhysicalProductStatusWithParams(
            reservationPhysicalProductAfterReservation.id,
            "DeliveredToBusiness"
          )

          reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
            reservationPhysicalProductAfterReservation.id
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

          expect(daysRented).toBe(19)
          expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
          expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(4))
          expect(comment).toBe("") // TODO:
        })

        describe("Reset Early", () => {
          it("Has been scanned on inbound", async () => {
            await setReservationPhysicalProductScannedOnInboundAtWithParams(
              reservationPhysicalProductAfterReservation.id,
              10
            )
            await prisma.client.reservationPhysicalProduct.update({
              where: { id: reservationPhysicalProductAfterReservation.id },
              data: {
                resetEarlyByAdminAt: timeUtils.xDaysAgoISOString(8),
                hasBeenResetEarlyByAdmin: true,
              },
            })
            await setReservationPhysicalProductStatusWithParams(
              reservationPhysicalProductAfterReservation.id,
              "ResetEarly"
            )

            reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
              reservationPhysicalProductAfterReservation.id
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

            expect(daysRented).toBe(13)
            expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
            expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(10))
            expect(comment).toBe("") // TODO:
          })

          it("Has not been scanned on inbound", async () => {
            await prisma.client.reservationPhysicalProduct.update({
              where: { id: reservationPhysicalProductAfterReservation.id },
              data: {
                resetEarlyByAdminAt: timeUtils.xDaysAgoISOString(8),
                hasBeenResetEarlyByAdmin: true,
              },
            })
            await setReservationPhysicalProductStatusWithParams(
              reservationPhysicalProductAfterReservation.id,
              "ResetEarly"
            )

            reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
              reservationPhysicalProductAfterReservation.id
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

            expect(daysRented).toBe(12)
            expectTimeToEqual(rentalStartedAt, twentyThreeDaysAgo)
            expectTimeToEqual(rentalEndedAt, timeUtils.xDaysAgoISOString(11))
            expect(comment).toBe("") // TODO:
          })
        })
      })
    })

    describe("On the way out", () => {
      beforeEach(async () => {
        initialReservation = await addToBagAndReserveForCustomerWithParams(1, {
          numDaysAgo: 1,
        })
        reservationPhysicalProductAfterReservation =
          initialReservation.reservationPhysicalProducts[0]
      })
      it("Queued at time of billing", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "Queued"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)
        expect(comment).toBe("") // TODO:
      })

      it("Picked at time of billing", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "Picked"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)
        expect(comment).toBe("") // TODO:
      })

      it("Packed at time of billing", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "Hold"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)
        expect(comment).toBe("") // TODO:
      })

      it("Hold at time of billing", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "Hold"
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)
        expect(comment).toBe("") // TODO:
      })

      it("ScannedOnOutbound at time of billing", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "ScannedOnOutbound"
        )
        await setReservationPhysicalProductScannedOnOutboundAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          0
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)
        expect(comment).toBe("") // TODO:
      })
      it("InTransitOutbound at time of billing", async () => {
        await setReservationPhysicalProductStatusWithParams(
          reservationPhysicalProductAfterReservation.id,
          "InTransitOutbound"
        )
        await setReservationPhysicalProductScannedOnOutboundAtWithParams(
          reservationPhysicalProductAfterReservation.id,
          1
        )

        reservationPhysicalProductWithData = await getReservationPhysicalProductWithDataWithParams(
          reservationPhysicalProductAfterReservation.id
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

        expect(daysRented).toBe(0)
        expect(rentalStartedAt).toBe(undefined)
        expect(rentalEndedAt).toBe(undefined)
        expect(comment).toBe("") // TODO:
      })
    })
  })
})
