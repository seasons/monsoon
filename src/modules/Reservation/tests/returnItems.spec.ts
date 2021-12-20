import {
  expectTimeToEqual,
  setReservationStatus,
} from "@app/modules/Payment/tests/utils/utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationService } from "../services/reservation.service"
import { ReservationTestUtilsService } from "./reservation.test.utils"
import { Customer } from ".prisma/client"

//This test suite is for the mutation associated with the customer's return flow
describe("Return Items", () => {
  let reservationService: ReservationService
  let prisma: PrismaService
  let testService: TestUtilsService
  let reservationTestService: ReservationTestUtilsService

  let testCustomer: Customer
  let reservation
  let rppIdsToReturn

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)
    reservationTestService = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
  })

  beforeEach(async () => {
    const { customer } = await testService.createTestCustomer()

    testCustomer = customer

    const {
      reservation: _reservation,
      bagItems,
    } = await reservationTestService.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 3,
      options: { numDaysAgo: 20 },
    })

    reservation = _reservation
    await setReservationStatus(reservation.id, "Delivered", { prisma: prisma })
    const bagItemsToReturn = await prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItems.map(a => a.id),
        },
      },
      select: {
        reservationPhysicalProductId: true,
      },
    })
    rppIdsToReturn = bagItemsToReturn.map(a => a.reservationPhysicalProductId)
  })

  it("sets customerReturnIntentAt and hasCustomerReturnIntent on reservationPhysicalProducts, without return reasons", async () => {
    await reservationService.returnItems(rppIdsToReturn, [], testCustomer)
    const postReturnRpps = await prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          id: { in: rppIdsToReturn },
        },
        select: {
          status: true,
          hasCustomerReturnIntent: true,
          customerReturnIntentAt: true,
        },
      }
    )

    postReturnRpps.forEach(resPhysProd => {
      expect(resPhysProd.status).toBe("ReturnPending")
      expectTimeToEqual(resPhysProd.customerReturnIntentAt, new Date())
      expect(resPhysProd.hasCustomerReturnIntent).toBe(true)
    })
  })

  it("sets return reason if included in payload", async () => {
    await reservationService.returnItems(
      rppIdsToReturn,
      rppIdsToReturn.map(id => {
        return {
          reservationPhysicalProductId: id,
          reason: "FitTooBig",
        }
      }),
      testCustomer
    )

    const postReturnRpps = await prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          id: { in: rppIdsToReturn },
        },
        select: {
          status: true,
          hasCustomerReturnIntent: true,
          customerReturnIntentAt: true,
          returnReason: true,
        },
      }
    )

    postReturnRpps.forEach(resPhysProd => {
      expect(resPhysProd.status).toBe("ReturnPending")
      expectTimeToEqual(resPhysProd.customerReturnIntentAt, new Date())
      expect(resPhysProd.hasCustomerReturnIntent).toBe(true)
      expect(resPhysProd.returnReason).toBe("FitTooBig")
    })
  })
})
