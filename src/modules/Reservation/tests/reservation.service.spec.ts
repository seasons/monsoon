import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { TestUtilsService } from "@modules/Test/services/test.service"
import { Test } from "@nestjs/testing"
import { Customer } from "@prisma/client"
import chargebee from "chargebee"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationService } from "../services/reservation.service"
import { ReservationTestUtilsService } from "./reservation.test.utils"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let testService: TestUtilsService
  let prisma: PrismaService
  let timeUtils: TimeUtilsService
  let testCustomer: Customer
  let reservationUtilsTestService: ReservationTestUtilsService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()
    prisma = moduleRef.get<PrismaService>(PrismaService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)
    reservationUtilsTestService = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )

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
    const {
      reservation,
    } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 2,
    })

    await reservationUtilsTestService.setReservationCreatedAt(reservation.id, 2)

    const lineItems = await reservationService.draftReservationLineItems({
      application: "flare",
      reservation,
      customer: testCustomer,
      shippingCode: "UPSGround",
    })

    const {
      reservation: otherReservation,
    } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 2,
    })

    const otherLineItems = await reservationService.draftReservationLineItems({
      application: "flare",
      reservation: otherReservation,
      customer: testCustomer,
      shippingCode: "UPSGround",
    })

    const shippingLineItem = lineItems.filter(li => li.name === "Shipping")?.[0]
    expect(shippingLineItem).toBeDefined()
    expect(shippingLineItem.price).toBe(0)

    const otherShippingLineItem = otherLineItems.filter(
      li => li.name === "Shipping"
    )?.[0]
    expect(otherShippingLineItem).toBeDefined()
    expect(otherShippingLineItem.price).toBeGreaterThan(0)
  })

  it("doesnt charge for shipping if Pickup is selected", async () => {
    const {
      reservation,
    } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 2,
      options: {
        shippingCode: "Pickup",
      },
    })

    const lineItems = await reservationService.draftReservationLineItems({
      application: "flare",
      shippingCode: "Pickup",
      customer: testCustomer,
      reservation,
    })

    expect(lineItems.filter(li => li.name === "Shipping").length).toBe(0)
  })
})
