import { ReservationService } from "@app/modules/Reservation"
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
  overridePrices,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "./utils/utils"

describe("Calculate Current Balance", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let reservationService: ReservationService

  let testCustomer

  let addToBagAndReserveForCustomerWithParams
  let setReservationCreatedAtWithParams
  let setPackageDeliveredAtWithParams
  let setReservationStatusWithParams
  let setPackageEnteredSystemAtWithParams
  let getCustWithDataWithParams
  let overridePricesWithParams

  let currentBalance
  let estimatedTotal

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)
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
    addToBagAndReserveForCustomerWithParams = numBagItems =>
      addToBagAndReserveForCustomer(testCustomer, numBagItems, {
        prisma,
        reservationService,
      })
    getCustWithDataWithParams = () =>
      getCustWithData(testCustomer, {
        prisma,
        select: {},
      })
    overridePricesWithParams = (seasonsUIDs, prices) =>
      overridePrices(seasonsUIDs, prices, { prisma })
  })
  describe("Basic Logic Works. No Packages or Returns.", () => {
    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
        },
        create: {
          membership: {
            create: {
              rentalInvoices: {
                create: {
                  billingStartAt: timeUtils.xDaysAgoISOString(20),
                  billingEndAt: timeUtils.xDaysFromNowISOString(10),
                },
              },
            },
          },
        } as any,
      })
      testCustomer = customer

      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 17)
      await setPackageEnteredSystemAtWithParams(
        initialReservation.sentPackage.id,
        16
      )
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        15
      )
      await setReservationStatusWithParams(initialReservation.id, "Delivered")

      await overridePricesWithParams(
        initialReservation.products.map(a => a.seasonsUID),
        [20, 40]
      )

      currentBalance = await rentalService.calculateCurrentBalance(
        testCustomer.id,
        { upTo: "today" }
      )
      estimatedTotal = await rentalService.calculateCurrentBalance(
        testCustomer.id,
        { upTo: "billingEnd" }
      )
    })

    it("Calculates the current balance properly", () => {
      // $20/month product held for 15 days --> $10
      // $40/month product held for 15 days --> $20
      expect(currentBalance).toEqual(3000)
    })

    it("Calcualtes the estimated total properly", () => {
      // $20/month product held for 25 days --> 16.67
      // $40/month product held for 25 days --> 33.33
      expect(estimatedTotal).toBe(5000)
    })
  })

  describe("Takes into account returns and packages", () => {
    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: {
          id: true,
        },
        create: {
          membership: {
            create: {
              rentalInvoices: {
                create: {
                  billingStartAt: timeUtils.xDaysAgoISOString(20),
                  billingEndAt: timeUtils.xDaysFromNowISOString(10),
                },
              },
            },
          },
        } as any,
      })
      testCustomer = customer

      // Place an initial reservation
      const initialReservation = await addToBagAndReserveForCustomerWithParams(
        2
      )
      await setReservationCreatedAtWithParams(initialReservation.id, 17)
      await setPackageEnteredSystemAtWithParams(
        initialReservation.sentPackage.id,
        16
      )
      await setPackageDeliveredAtWithParams(
        initialReservation.sentPackage.id,
        15
      )

      // Fake its return
      await setReservationStatusWithParams(initialReservation.id, "Completed")
      await prisma.client.reservation.update({
        where: { id: initialReservation.id },
        data: {
          returnedAt: timeUtils.xDaysAgoISOString(7),
          returnedProducts: {
            connect: initialReservation.products.map(a => ({
              seasonsUID: a.seasonsUID,
            })),
          },
        },
      })
      const returnPackage = initialReservation.returnPackages[0]
      await setPackageEnteredSystemAtWithParams(returnPackage.id, 9)

      // Place another reservation
      const secondReservation = await addToBagAndReserveForCustomerWithParams(2)
      await setReservationCreatedAtWithParams(secondReservation.id, 5)
      await setPackageEnteredSystemAtWithParams(
        secondReservation.sentPackage.id,
        4
      )
      await setPackageDeliveredAtWithParams(secondReservation.sentPackage.id, 3)

      const reservationOneProducts = initialReservation.products.map(
        a => a.seasonsUID
      )
      await overridePricesWithParams(reservationOneProducts, [20, 40])
      const reservationTwoProducts = secondReservation.products
        .map(a => a.seasonsUID)
        .filter(a => !reservationOneProducts.includes(a))
      await overridePricesWithParams(reservationTwoProducts, [30, 50])

      currentBalance = await rentalService.calculateCurrentBalance(
        testCustomer.id,
        { upTo: "today" }
      )
      estimatedTotal = await rentalService.calculateCurrentBalance(
        testCustomer.id,
        { upTo: "billingEnd" }
      )
    })

    it("Calculates the current balance properly", () => {
      // $20/month product held for 8 days --> 5.33
      // $40/month product held for 8 days --> 10.67
      // $30/month product held for 3 days --> 3
      // $50/month product held for 3 days --> 5
      // inbound package for reservation one --> 10
      // outbound package for reservation two --> 10
      expect(0).toBe(4400)
    })

    it("Calcualtes the estimated total properly", () => {
      // $20/month product held for 8 days --> 5.33
      // $40/month product held for 8 days --> 10.67
      // $30/month product held for 13 days --> 13
      // $50/month product held for 13 days --> 21.67
      // inbound package for reservation one --> 10
      // outbound package for reservation two --> 10
      expect(0).toBe(7067)
    })
  })
})
