import { APP_MODULE_DEF } from "@app/app.module"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { RentalService } from "../services/rental.service"

describe("Create Rental Invoice Line Items", () => {
  let testUtils: TestUtilsService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    // prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    // reserveService = moduleRef.get<ReserveService>(ReserveService)
    // reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
    //   ReservationTestUtilsService
    // )
  })
  describe("Rental Usage Line Items", () => {
    let lineItemDatas
    beforeAll(async () => {
      const calcDaysRentedMock = jest
        .spyOn(rentalService, "calcDaysRented")
        .mockImplementation(async (invoice, reservationPhysicalProduct) => {
          switch (reservationPhysicalProduct.id) {
            case "1":
              return {
                daysRented: 1,
                rentalStartedAt: timeUtils.xDaysAgo(10),
                rentalEndedAt: timeUtils.xDaysAgo(9),
                comment: "'",
              }
            case "2":
              return {
                daysRented: 2,
                rentalStartedAt: timeUtils.xDaysAgo(8),
                rentalEndedAt: timeUtils.xDaysAgo(7),
                comment: "'",
              }
            case "3":
              return {
                daysRented: 3,
                rentalStartedAt: timeUtils.xDaysAgo(6),
                rentalEndedAt: timeUtils.xDaysAgo(5),
                comment: "'",
              }
            default:
              throw "Invalid id"
          }
        })
      const calculatePriceForDaysRentedMock = jest
        .spyOn(rentalService, "calculatePriceForDaysRented")
        .mockImplementation(
          async ({ invoice, customer, product, daysRented }) => {
            switch (product.id) {
              case "1":
                return {
                  price: 100,
                  appliedMinimum: false,
                  adjustedForPreviousMinimum: false,
                }
              case "2":
                return {
                  price: 200,
                  appliedMinimum: false,
                  adjustedForPreviousMinimum: false,
                }
              case "3":
                return {
                  price: 300,
                  appliedMinimum: false,
                  adjustedForPreviousMinimum: false,
                }
              default:
                throw "Invalid id"
            }
          }
        )
      lineItemDatas = await rentalService.getRentalUsageLineItemDatas({
        membership: { customer: null },
        reservationPhysicalProducts: [
          { id: "1", physicalProduct: { id: "1" } },
          { id: "2", physicalProduct: { id: "2" } },
          { id: "3", physicalProduct: { id: "3" } },
        ],
      } as any)
      calcDaysRentedMock.mockRestore()
      calculatePriceForDaysRentedMock.mockRestore()
    })
    it("Creates a line item for each reservationPhysicalProduct on the invoice", () => {
      expect(lineItemDatas.length).toBe(3)
    })

    it("Stores the proper value of daysRented", () => {
      expect(lineItemDatas[0].daysRented).toBe(1)
      expect(lineItemDatas[1].daysRented).toBe(2)
      expect(lineItemDatas[2].daysRented).toBe(3)
    })

    it("Stores the proper values of rentalStartedAt and rentalEndedAt", () => {
      testUtils.expectTimeToEqual(
        lineItemDatas[0].rentalStartedAt,
        timeUtils.xDaysAgo(10)
      )
      testUtils.expectTimeToEqual(
        lineItemDatas[1].rentalStartedAt,
        timeUtils.xDaysAgo(8)
      )
      testUtils.expectTimeToEqual(
        lineItemDatas[2].rentalStartedAt,
        timeUtils.xDaysAgo(6)
      )

      testUtils.expectTimeToEqual(
        lineItemDatas[0].rentalEndedAt,
        timeUtils.xDaysAgo(9)
      )
      testUtils.expectTimeToEqual(
        lineItemDatas[1].rentalEndedAt,
        timeUtils.xDaysAgo(7)
      )
      testUtils.expectTimeToEqual(
        lineItemDatas[2].rentalEndedAt,
        timeUtils.xDaysAgo(5)
      )
    })
    it("Connects the proper physical product to the line item", () => {
      expect(lineItemDatas[0].physicalProduct.connect.id).toBe("1")
      expect(lineItemDatas[1].physicalProduct.connect.id).toBe("2")
      expect(lineItemDatas[2].physicalProduct.connect.id).toBe("3")
    })
    it("Stores the proper price", () => {
      expect(lineItemDatas[0].price).toBe(100)
      expect(lineItemDatas[1].price).toBe(200)
      expect(lineItemDatas[2].price).toBe(300)
    })
  })

  describe("Package Line Items", () => {
    describe("Inbound Packages", () => {
      // Charges for the return package if a reservation was created in a previous billing cycle and returned in this one
      //Charges for the return package if a reservation was created and returned in this billing cycle
      // Charges for each inbound package only once
    })

    describe("Outbound Packages", () => {
      /* "If a customer picked up their reservation, do not charge for the outbound package" 
        "If a customer picks up their first reservation, and their second reservation, and then has the third one shipped ground, do not charge him on the third reservation."
        "If a customer picks up their first reservation, and their second reservation, and then has the third one shipped select, charge him on the third reservation"
        "If a customer only has one shipped (ground) outbound package in this billing cycle, do not charge him" 
        "If a customer only has one shipped, select package in this billing cycle, charge him"
        "If a customer's first outbound package is select, and the second outbound package is ground, charge him for both"
        "If a customer placed 3 reservations in the same day and chose ground shipping, then never reserved anything else in the billing cycle, do not charge him"
        "If a customer's second outbound package includes items from multiple reservations placed in the same day, only charge him for one outbound package"
        "If a customer has more than one shipped outbound package in this billing cycle, charge him for all but the first"
        */
    })

    describe("Package discounts", () => {
      // Discounts an outbound select package by 55%
      // Discounts an inbound ground package by 38%
      // Discounts an outbound ground package by 30%
    })
  })
})
