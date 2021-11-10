import { CustomerService } from "@app/modules/User/services/customer.service"
import { TestUtilsService } from "@modules/Utils/services/test.service"
import { Test } from "@nestjs/testing"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationService } from "../services/reservation.service"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let customerService: CustomerService
  let testService: TestUtilsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)
  })

  it("if customer is in california and shipping method", async () => {
    expect(reservationService).toBeTruthy()

    const { cleanupFunc, customer } = await testService.createTestCustomer({
      create: {
        detail: {
          create: {
            shippingAddress: {
              create: {
                address1: "855 N Vermont Ave",
                city: "Los Angeles",
                state: "CA",
                zipCode: "90029",
              },
            },
          },
        },
      },
    })

    // reservationService.draftReservationLineItems({
    //   application: "flare",

    // })
  })
})
