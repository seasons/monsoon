import { APP_MODULE_DEF } from "@app/app.module"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"

import { RentalService } from "../services/rental.service"

describe("Create Rental Invoice Line Items", () => {
  let testUtils: TestUtilsService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let shipping: ShippingService

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    // prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    shipping = moduleRef.get<ShippingService>(ShippingService)
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
      let discountShippingRateMock

      beforeAll(() => {
        discountShippingRateMock = jest
          .spyOn(shipping, "discountShippingRate")
          .mockImplementation((rate, servicelevel, shipmentType) => {
            return rate
          })
      })
      afterAll(() => {
        discountShippingRateMock.mockRestore()
      })

      it("Creates a line item if an inbound package was delivered during this billing cycle", () => {
        const inboundPackageLineItemDatas = rentalService.getInboundPackageLineItemDatas(
          {
            billingStartAt: timeUtils.xDaysAgo(30),
            billingEndAt: timeUtils.xDaysAgo(1),
            reservationPhysicalProducts: [
              {
                inboundPackage: {
                  id: "1",
                  amount: 100,
                  deliveredAt: timeUtils.xDaysAgo(15),
                  items: [{ seasonsUID: "suid1" }],
                },
              },
            ],
          }
        )

        expect(inboundPackageLineItemDatas.length).toBe(1)
        expect(inboundPackageLineItemDatas[0].name).toBe("InboundPackage-1")
        expect(inboundPackageLineItemDatas[0].price).toBe(100)
      })

      it("Does not create a line item if an inbound package was delivered before this billing cycle", () => {
        const inboundPackageLineItemDatas = rentalService.getInboundPackageLineItemDatas(
          {
            billingStartAt: timeUtils.xDaysAgo(30),
            billingEndAt: timeUtils.xDaysAgo(1),
            reservationPhysicalProducts: [
              {
                inboundPackage: {
                  id: "1",
                  amount: 100,
                  deliveredAt: timeUtils.xDaysAgo(45),
                  items: [{ seasonsUID: "suid1" }],
                },
              },
            ],
          }
        )

        expect(inboundPackageLineItemDatas.length).toBe(0)
      })

      it("Does not create a line item if an inbound package was delivered after this billing cycle", () => {
        const inboundPackageLineItemDatas = rentalService.getInboundPackageLineItemDatas(
          {
            billingStartAt: timeUtils.xDaysAgo(60),
            billingEndAt: timeUtils.xDaysAgo(30),
            reservationPhysicalProducts: [
              {
                inboundPackage: {
                  id: "1",
                  amount: 100,
                  deliveredAt: timeUtils.xDaysAgo(29),
                  items: [{ seasonsUID: "suid1" }],
                },
              },
            ],
          }
        )

        expect(inboundPackageLineItemDatas.length).toBe(0)
      })

      it("Does not create a line item if an inbound package has not been delivered", () => {
        const inboundPackageLineItemDatas = rentalService.getInboundPackageLineItemDatas(
          {
            billingStartAt: timeUtils.xDaysAgo(30),
            billingEndAt: timeUtils.xDaysAgo(1),
            reservationPhysicalProducts: [
              {
                inboundPackage: {
                  id: "1",
                  amount: 100,
                  deliveredAt: undefined,
                  items: [{ seasonsUID: "suid1" }],
                },
              },
            ],
          }
        )

        expect(inboundPackageLineItemDatas.length).toBe(0)
      })

      it("Only charges for an inbound package once, even if it's on multiple reservations", () => {
        const returnPackage1 = {
          id: "1",
          amount: 100,
          deliveredAt: timeUtils.xDaysAgo(15),
          items: [{ seasonsUID: "suid1" }, { seasonsUID: "suid2" }],
        }
        const inboundPackageLineItemDatas = rentalService.getInboundPackageLineItemDatas(
          {
            billingStartAt: timeUtils.xDaysAgo(30),
            billingEndAt: timeUtils.xDaysAgo(1),
            reservationPhysicalProducts: [
              {
                inboundPackage: returnPackage1,
              },
              {
                inboundPackage: returnPackage1,
              },
              {
                inboundPackage: {
                  id: "2",
                  amount: 200,
                  deliveredAt: timeUtils.xDaysAgo(5),
                  items: [{ seasonsUID: "suid2" }],
                },
              },
            ],
          }
        )

        expect(inboundPackageLineItemDatas.length).toBe(2)
        expect(inboundPackageLineItemDatas[0].price).toBe(100)
        expect(inboundPackageLineItemDatas[1].price).toBe(200)
      })
    })

    describe("Outbound Packages", () => {
      let discountShippingRateMock

      beforeAll(() => {
        discountShippingRateMock = jest
          .spyOn(shipping, "discountShippingRate")
          .mockImplementation((rate, servicelevel, shipmentType) => {
            return rate
          })
      })
      afterAll(() => {
        discountShippingRateMock.mockRestore()
      })

      describe("Function: Get Outbound Package Line Item Datas From This Billing Cycle", () => {
        describe("Ignores packages created in other billing cycles", () => {
          it("If a package was created before this billing cycle, does not create a line item", () => {
            const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
              {
                billingStartAt: timeUtils.xDaysAgo(30),
                billingEndAt: timeUtils.xDaysAgo(1),
                reservationPhysicalProducts: [
                  {
                    outboundPackage: {
                      id: "1",
                      createdAt: timeUtils.xDaysAgo(45),
                      enteredDeliverySystemAt: timeUtils.xDaysAgo(44),
                      amount: 100,
                      shippingMethod: { code: "UPSGround" },
                    },
                  },
                  {
                    outboundPackage: {
                      id: "2",
                      createdAt: timeUtils.xDaysAgo(40),
                      enteredDeliverySystemAt: timeUtils.xDaysAgo(39),
                      amount: 100,
                      shippingMethod: { code: "UPSGround" },
                    },
                  },
                ],
              }
            )

            expect(lineItemDatas.length).toBe(0)
          })

          it("If a package was created after this billing cycle, does not create a line item", () => {
            const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
              {
                billingStartAt: timeUtils.xDaysAgo(60),
                billingEndAt: timeUtils.xDaysAgo(30),
                reservationPhysicalProducts: [
                  {
                    outboundPackage: {
                      id: "1",
                      createdAt: timeUtils.xDaysAgo(15),
                      enteredDeliverySystemAt: timeUtils.xDaysAgo(14),
                      amount: 100,
                      shippingMethod: { code: "UPSGround" },
                    },
                  },
                  {
                    outboundPackage: {
                      id: "2",
                      createdAt: timeUtils.xDaysAgo(5),
                      enteredDeliverySystemAt: timeUtils.xDaysAgo(4),
                      amount: 100,
                      shippingMethod: { code: "UPSGround" },
                    },
                  },
                ],
              }
            )

            expect(lineItemDatas.length).toBe(0)
          })
        })

        describe("Properly processes packages created in this billing cycle", () => {
          describe("First shipped package of cycle", () => {
            it("If it's select, creates a line item with nonzero price", () => {
              const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
                {
                  billingStartAt: new Date(2021, 1, 1),
                  billingEndAt: new Date(2021, 2, 1),
                  reservationPhysicalProducts: [
                    {
                      outboundPackage: {
                        id: "1",
                        createdAt: new Date(2021, 1, 15),
                        enteredDeliverySystemAt: new Date(2021, 1, 16),
                        amount: 2000,
                        shippingMethod: { code: "UPSSelect" },
                      },
                    },
                  ],
                }
              )

              expect(lineItemDatas.length).toBe(1)
              expect(lineItemDatas[0].price).toBe(2000)
              expect(lineItemDatas[0].name).toBe(
                "Outbound package shipped 2.16"
              )
              expect(lineItemDatas[0].comment).toBe(
                "First shipped outbound package of billing cycle. Used premium shipping method. Charge"
              )
            })

            it("If it's ground, creates a line item with 0 price", () => {
              const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
                {
                  billingStartAt: new Date(2021, 1, 1),
                  billingEndAt: new Date(2021, 2, 1),
                  reservationPhysicalProducts: [
                    {
                      outboundPackage: {
                        id: "1",
                        createdAt: new Date(2021, 1, 15),
                        enteredDeliverySystemAt: new Date(2021, 1, 16),
                        amount: 2000,
                        shippingMethod: { code: "UPSGround" },
                      },
                    },
                  ],
                }
              )

              expect(lineItemDatas.length).toBe(1)
              expect(lineItemDatas[0].price).toBe(0)
              expect(lineItemDatas[0].name).toBe(
                "Outbound package shipped 2.16"
              )
              expect(lineItemDatas[0].comment).toBe(
                "First shipped outbound package of billing cycle. Did not use premium shipping method. No charge"
              )
            })
          })

          describe("2nd or later shipped packages of cycle", () => {
            it("If it's select, creates a line item with nonzero price", () => {
              const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
                {
                  billingStartAt: new Date(2021, 1, 1),
                  billingEndAt: new Date(2021, 2, 1),
                  reservationPhysicalProducts: [
                    {
                      outboundPackage: {
                        id: "1",
                        createdAt: new Date(2021, 1, 15),
                        enteredDeliverySystemAt: new Date(2021, 1, 16),
                        amount: 2000,
                        shippingMethod: { code: "UPSGround" },
                      },
                    },
                    {
                      outboundPackage: {
                        id: "2",
                        createdAt: new Date(2021, 1, 20),
                        enteredDeliverySystemAt: new Date(2021, 1, 21),
                        amount: 2000,
                        shippingMethod: { code: "UPSSelect" },
                      },
                    },
                  ],
                }
              )

              expect(lineItemDatas.length).toBe(2)
              const secondLineItem = lineItemDatas[1]
              expect(secondLineItem.price).toBeGreaterThan(0)
              expect(secondLineItem.name).toBe("Outbound package shipped 2.21")
              expect(secondLineItem.comment).toBe(
                "Shipped outbound package 2 of billing cycle. Charge."
              )
            })

            it("If it's ground, creates a line item with nonzero price", () => {
              const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
                {
                  billingStartAt: new Date(2021, 1, 1),
                  billingEndAt: new Date(2021, 2, 1),
                  reservationPhysicalProducts: [
                    {
                      outboundPackage: {
                        id: "1",
                        createdAt: new Date(2021, 1, 15),
                        enteredDeliverySystemAt: new Date(2021, 1, 16),
                        amount: 2000,
                        shippingMethod: { code: "UPSGround" },
                      },
                    },
                    {
                      outboundPackage: {
                        id: "2",
                        createdAt: new Date(2021, 1, 20),
                        enteredDeliverySystemAt: new Date(2021, 1, 21),
                        amount: 2000,
                        shippingMethod: { code: "UPSGround" },
                      },
                    },
                  ],
                }
              )

              expect(lineItemDatas.length).toBe(2)
              const secondLineItem = lineItemDatas[1]
              expect(secondLineItem.price).toBeGreaterThan(0)
              expect(secondLineItem.name).toBe("Outbound package shipped 2.21")
              expect(secondLineItem.comment).toBe(
                "Shipped outbound package 2 of billing cycle. Charge."
              )
            })
          })
        })

        it("Charges for any given package only once", () => {
          expect(0).toBe(1)
        })
      })

      describe("Function: Get Outbound Package Line Item Datas From Previous Billing Cycle", () => {
        it("TODO", () => {
          expect(0).toBe(1)
        })
      })
    })

    describe("Package discounts", () => {
      // Discounts an outbound select package by 55%
      // Discounts an inbound ground package by 38%
      // Discounts an outbound ground package by 30%
    })
  })
})
