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
  let bagItemsToReturn
  let physicalProductIdsToReturn

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
    bagItemsToReturn = await prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItems.map(a => a.id),
        },
      },
      select: {
        physicalProductId: true,
      },
    })
    physicalProductIdsToReturn = bagItemsToReturn.map(a => a.physicalProductId)
    await reservationService.returnItems(
      physicalProductIdsToReturn,
      testCustomer
    )
  })

  it("sets customerReturnIntentAt and hasCustomerReturnIntent on reservationPhysicalProducts", async () => {
    let returnPendingResPhysProds = await prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          physicalProduct: {
            id: {
              in: physicalProductIdsToReturn,
            },
          },
        },
        select: {
          status: true,
          hasCustomerReturnIntent: true,
          customerReturnIntentAt: true,
        },
      }
    )

    returnPendingResPhysProds.forEach(resPhysProd => {
      expect(resPhysProd.status).toBe("ReturnPending")
      expectTimeToEqual(resPhysProd.customerReturnIntentAt, new Date())
      expect(resPhysProd.hasCustomerReturnIntent).toBe(true)
    })
  })
})
