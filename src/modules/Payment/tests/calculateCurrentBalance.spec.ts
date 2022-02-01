import { ReservationService } from "@app/modules/Reservation"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"

// All the helper funcs in this are well tested. So here we just test the aggregation logic
describe("Calculate Current Balance", () => {
  let testUtils: TestUtilsService
  let prisma: PrismaService
  let rentalService: RentalService

  let calcDaysRentedMock, currentBalance

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)
    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)

    jest.spyOn(prisma.client.rentalInvoice, "findFirst").mockResolvedValue({
      reservationPhysicalProducts: [{ id: "1" }, { id: "2" }],
    } as any)

    calcDaysRentedMock = jest
      .spyOn(rentalService, "calcDaysRented")
      .mockResolvedValue({ daysRented: 5 } as any)

    jest
      .spyOn(rentalService, "calculateRentalPrice")
      .mockImplementation(async ({ reservationPhysicalProduct }) => {
        const data = {
          appliedMinimum: false,
          adjustedForPreviousMinimum: false,
        }
        if (reservationPhysicalProduct.id === "1") {
          return { price: 10, ...data }
        } else if (reservationPhysicalProduct.id === "2") {
          return { price: 20, ...data }
        } else {
          throw "Unexpected ID"
        }
      })
    jest
      .spyOn(
        rentalService,
        "getOutboundPackageLineItemDatasFromPreviousBillingCycle"
      )
      //@ts-ignore
      .mockResolvedValue([{ price: 10 }])
    jest
      .spyOn(
        rentalService,
        "getOutboundPackageLineItemDatasFromThisBillingCycle"
      )
      //@ts-ignore
      .mockReturnValue([{ price: 30 }])
    jest
      .spyOn(rentalService, "getInboundPackageLineItemDatas")
      //@ts-ignore
      .mockReturnValue([{ price: 30 }])

    currentBalance = await rentalService.calculateCurrentBalance("fakeId", {
      upTo: "today",
    })
  })
  it("Correctly aggregates rental usage and package prices", async () => {
    expect(currentBalance).toBe(100)
  })

  it("Calls calcDaysRented with the proper upTo value", () => {
    expect(calcDaysRentedMock).toHaveBeenCalledWith(
      { reservationPhysicalProducts: [{ id: "1" }, { id: "2" }] },
      { id: "1" },
      {
        upTo: "today",
      }
    )
  })
})
