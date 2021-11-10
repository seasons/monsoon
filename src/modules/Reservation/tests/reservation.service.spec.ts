import {
  addToBagAndReserveForCustomer,
  setReservationCreatedAt,
} from "@app/modules/Payment/tests/utils/utils"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { TestUtilsService } from "@modules/Utils/services/test.service"
import { Test } from "@nestjs/testing"
import { Customer } from "@prisma/client"
import chargebee from "chargebee"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationService } from "../services/reservation.service"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let testService: TestUtilsService
  let prisma: PrismaService
  let timeUtils: TimeUtilsService
  let testCustomer: Customer

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()
    prisma = moduleRef.get<PrismaService>(PrismaService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)

    const { customer } = await testService.createTestCustomer({
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

    testCustomer = customer

    // The prices don't correspond to the prices of the items being purchased
    // in these tests. They are just dummy values that will allow the code to run
    jest.spyOn(chargebee.estimate, "create_invoice").mockReturnValue({
      request: async () => ({
        estimate: {
          invoice_estimate: {
            sub_total: 1000,
            total: 1080,
            line_items: [{ tax_rate: 0.08, tax_amount: 80 }],
            taxes: [],
          },
        },
      }),
    })

    // We just need the status to return as "paid" in order for the code to run
    jest.spyOn(chargebee.invoice, "create").mockReturnValue({
      request: async () => ({
        invoice: {
          status: "paid",
        },
      }),
    })
  })

  it("doesnt charge for the first reservation but charges for the any subsequent ones if UPS Ground is selected", async () => {
    const reservation = await addToBagAndReserveForCustomer(testCustomer, 2, {
      prisma,
      reservationService,
    })

    await setReservationCreatedAt(reservation.id, 2, { prisma, timeUtils })

    const lineItems = await reservationService.draftReservationLineItems({
      application: "flare",
      reservation,
      customer: testCustomer,
      shippingCode: "UPSGround",
    })

    const otherReservation = await addToBagAndReserveForCustomer(
      testCustomer,
      2,
      {
        prisma,
        reservationService,
      }
    )

    const otherLineItems = await reservationService.draftReservationLineItems({
      application: "flare",
      reservation: otherReservation,
      customer: testCustomer,
      shippingCode: "UPSGround",
    })

    expect(lineItems.filter(li => li.name === "Shipping").length).toBe(0)
    expect(otherLineItems.filter(li => li.name === "Shipping").length).toBe(1)
  })

  it("doesnt charge for shipping if Pickup is selected", async () => {
    const reservation = await addToBagAndReserveForCustomer(
      testCustomer,
      2,
      {
        prisma,
        reservationService,
      },
      { shippingCode: "Pickup" }
    )

    const lineItems = await reservationService.draftReservationLineItems({
      application: "flare",
      shippingCode: "Pickup",
      customer: testCustomer,
      reservation,
    })

    expect(lineItems.filter(li => li.name === "Shipping").length).toBe(0)
  })
})
