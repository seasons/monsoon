import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { ReservationUtilsService } from "@app/modules/Utils/services/reservation.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Customer } from "@prisma/client"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationPhysicalProductService } from "../services/reservationPhysicalProduct.service"
import { ReservationTestUtilsService } from "./reservation.test.utils"

describe("Update reservation on change", () => {
  let reservationPhysicalProductService: ReservationPhysicalProductService
  let reservationTestUtil: ReservationTestUtilsService
  let reservationUtils: ReservationUtilsService
  let testService: TestUtilsService
  let prisma: PrismaService
  let testCustomer: Customer
  let reservation
  let changeReservation
  let rpps

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()
    reservationPhysicalProductService = moduleRef.get<
      ReservationPhysicalProductService
    >(ReservationPhysicalProductService)
    reservationTestUtil = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
    reservationUtils = moduleRef.get<ReservationUtilsService>(
      ReservationUtilsService
    )
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    const cleanupFuncs = []
    const { cleanupFunc, customer } = await testService.createTestCustomer()
    cleanupFuncs.push(cleanupFunc)
    testCustomer = customer

    changeReservation = async (
      status: "Lost" | "ReturnProcessed" | "DeliveredToCustomer"
    ) => {
      const rppStatusesAfterChange = {}
      rpps.forEach(a => (rppStatusesAfterChange[a.id] = status))

      await prisma.client.$transaction(
        await reservationUtils.updateReservationOnChange(
          [reservation.id],
          rppStatusesAfterChange
        )
      )

      return await prisma.client.reservation.findUnique({
        where: {
          id: reservation.id,
        },
        select: {
          status: true,
        },
      })
    }
  })

  beforeEach(async () => {
    const {
      reservation: _reservation,
      bagItems,
    } = await reservationTestUtil.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 3,
    })
    reservation = _reservation

    rpps = await prisma.client.reservationPhysicalProduct.findMany({
      where: {
        reservationId: reservation.id,
      },
      select: {
        id: true,
      },
    })
  })

  it("sets reservation to Completed if majority of the rpp's on said reservation have a status of ReturnProcessed", async () => {
    const completedRes = await changeReservation("ReturnProcessed")
    expect(completedRes.status).toBe("Completed")
  })

  it("sets reservation to Lost if majority of the rpp's on said reservation have a status of Lost", async () => {
    const lostRes = await changeReservation("Lost")
    expect(lostRes.status).toBe("Lost")
  })

  it("sets reservation to Delivered if majority of the rpp's on said reservation have a status of DeliveredToCustomer", async () => {
    const deliveredRes = await changeReservation("DeliveredToCustomer")
    expect(deliveredRes.status).toBe("Delivered")
  })
})
