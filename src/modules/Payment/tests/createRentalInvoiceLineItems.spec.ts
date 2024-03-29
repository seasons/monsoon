import { APP_MODULE_DEF } from "@app/app.module"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import cuid from "cuid"

import { RentalService } from "../services/rental.service"

describe("Create Rental Invoice Line Items", () => {
  let testUtils: TestUtilsService
  let rentalService: RentalService
  let timeUtils: TimeUtilsService
  let shipping: ShippingService
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(APP_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rentalService = moduleRef.get<RentalService>(RentalService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    shipping = moduleRef.get<ShippingService>(ShippingService)
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
        .spyOn(rentalService, "calculateRentalPrice")
        .mockImplementation(
          async ({
            invoice,
            customer,
            reservationPhysicalProduct,
            daysRented,
          }) => {
            switch (reservationPhysicalProduct.id) {
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

  describe("Package Line Item Creation", () => {
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
                "First shipped outbound package of current billing cycle. Used premium shipping method. Charge"
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
                "First shipped outbound package of current billing cycle. Did not use premium shipping method. No charge."
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
                "Shipped outbound package 2 of current billing cycle. Charge."
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
                "Shipped outbound package 2 of current billing cycle. Charge."
              )
            })
          })
        })

        it("Creates only one line item per package", () => {
          const outboundPackage = {
            id: "1",
            createdAt: new Date(2021, 1, 15),

            enteredDeliverySystemAt: new Date(2021, 1, 16),
            amount: 2000,
            shippingMethod: { code: "UPSGround" },
          } as any
          const lineItemDatas = rentalService.getOutboundPackageLineItemDatasFromThisBillingCycle(
            {
              billingStartAt: new Date(2021, 1, 1),
              billingEndAt: new Date(2021, 2, 1),
              reservationPhysicalProducts: [
                {
                  outboundPackage,
                },
                {
                  outboundPackage,
                },
              ],
            }
          )

          expect(lineItemDatas.length).toBe(1)
        })
      })

      describe("Function: Get Outbound Package Line Item Datas From Previous Billing Cycle", () => {
        let mocksToRestore = []
        afterEach(async () => {
          mocksToRestore.forEach(mock => mock.mockRestore())
          mocksToRestore = []
        })

        it("(Helper Func) Get Previous Rental Invoice with Package Data queries the proper invoice", async () => {
          const previousRentalInvoiceId = cuid()
          const { customer } = await testUtils.createTestCustomer({
            create: {
              membership: {
                create: {
                  rentalInvoices: {
                    createMany: {
                      data: [
                        {
                          id: previousRentalInvoiceId,
                          billingStartAt: timeUtils.xDaysAgoISOString(60),
                          billingEndAt: timeUtils.xDaysAgoISOString(30),
                          status: "Billed",
                        },
                      ],
                    },
                  },
                } as any,
              },
            },
            select: {
              id: true,
              membership: {
                select: {
                  rentalInvoices: {
                    select: { status: true, id: true, billingStartAt: true },
                  },
                },
              },
            },
          })

          const currentInvoice = customer.membership.rentalInvoices.find(
            a => a.status === "Draft"
          )
          const previousRentalInvoice = await rentalService.getPreviousRentalInvoiceWithPackageData(
            currentInvoice
          )
          expect(previousRentalInvoice.id).toBe(previousRentalInvoiceId)
        })

        it("If there's no previous invoice, creates no line items", async () => {
          const previousRentalInvoiceMock = jest
            .spyOn(rentalService, "getPreviousRentalInvoiceWithPackageData")
            .mockReturnValue(null)
          mocksToRestore.push(previousRentalInvoiceMock)
          const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
            {
              id: cuid(),
              billingEndAt: new Date(),
              billingStartAt: timeUtils.xDaysAgo(30),
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
          expect(lineItemDatas.length).toBe(0)
        })
        it("Ignores packages created in this billing cycle", async () => {
          const previousRentalInvoiceMock = jest
            .spyOn(rentalService, "getPreviousRentalInvoiceWithPackageData")
            .mockReturnValue({
              id: cuid(),
              billingStartAt: timeUtils.xDaysAgo(60),
              billingEndAt: timeUtils.xDaysAgo(30),
              reservationPhysicalProducts: [],
              lineItems: [],
            } as any)
          mocksToRestore.push(previousRentalInvoiceMock)
          const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
            {
              id: cuid(),
              billingEndAt: new Date(),
              billingStartAt: timeUtils.xDaysAgo(30),
              reservationPhysicalProducts: [
                {
                  outboundPackage: {
                    id: "1",
                    createdAt: timeUtils.xDaysAgo(15),
                    enteredDeliverySystemAt: timeUtils.xDaysAgo(14),
                    amount: 2000,
                    shippingMethod: { code: "UPSSelect" },
                  },
                },
              ],
            }
          )

          expect(lineItemDatas.length).toBe(0)
        })

        describe("Properly proceses packages created in the previous billing cycle", () => {
          it("Ignores packages created and shipped in the previous billing cycle", async () => {
            const previousRentalInvoiceMock = jest
              .spyOn(rentalService, "getPreviousRentalInvoiceWithPackageData")
              .mockReturnValue({
                id: cuid(),
                billingStartAt: timeUtils.xDaysAgo(60),
                billingEndAt: timeUtils.xDaysAgo(30),
                reservationPhysicalProducts: [
                  {
                    outboundPackage: {
                      id: true,
                      createdAt: timeUtils.xDaysAgo(36),
                      enteredDeliverySystemAt: timeUtils.xDaysAgo(35),
                    },
                  },
                ],
                lineItems: [],
              } as any)
            mocksToRestore.push(previousRentalInvoiceMock)
            const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
              {
                id: cuid(),
                billingEndAt: new Date(),
                billingStartAt: timeUtils.xDaysAgo(30),
                reservationPhysicalProducts: [],
              }
            )

            expect(lineItemDatas.length).toBe(0)
          })

          describe("Properly processes packages shipped in this billing cycle", () => {
            describe("First shipped package of previous cycle", () => {
              it("If it's select, creates a line item with nonzero price", async () => {
                const previousRentalInvoiceMock = jest
                  .spyOn(
                    rentalService,
                    "getPreviousRentalInvoiceWithPackageData"
                  )
                  .mockReturnValue({
                    id: cuid(),
                    billingStartAt: timeUtils.xDaysAgo(60),
                    billingEndAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [
                      {
                        outboundPackage: {
                          id: true,
                          amount: 2000,
                          createdAt: timeUtils.xDaysAgo(31),
                          enteredDeliverySystemAt: timeUtils.xDaysAgo(29),
                          shippingMethod: { code: "UPSSelect" },
                        },
                      },
                    ],
                    lineItems: [],
                  } as any)
                mocksToRestore.push(previousRentalInvoiceMock)
                const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
                  {
                    id: cuid(),
                    billingEndAt: new Date(),
                    billingStartAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [],
                  }
                )

                const shipmentDate = rentalService.formatPackageShipmentDate(
                  timeUtils.xDaysAgo(29)
                )
                expect(lineItemDatas.length).toBe(1)
                expect(lineItemDatas[0].price).toBeGreaterThan(0)
                expect(lineItemDatas[0].name).toBe(
                  `Outbound package shipped ${shipmentDate}`
                )
                expect(lineItemDatas[0].comment).toBe(
                  "First shipped outbound package of previous billing cycle. Used premium shipping method. Charge"
                )
              })

              it("if it's ground, creates a line item with zero price", async () => {
                const previousRentalInvoiceMock = jest
                  .spyOn(
                    rentalService,
                    "getPreviousRentalInvoiceWithPackageData"
                  )
                  .mockReturnValue({
                    id: cuid(),
                    billingStartAt: timeUtils.xDaysAgo(60),
                    billingEndAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [
                      {
                        outboundPackage: {
                          id: true,
                          amount: 2000,
                          createdAt: timeUtils.xDaysAgo(31),
                          enteredDeliverySystemAt: timeUtils.xDaysAgo(29),
                          shippingMethod: { code: "UPSGround" },
                        },
                      },
                    ],
                    lineItems: [],
                  } as any)
                mocksToRestore.push(previousRentalInvoiceMock)
                const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
                  {
                    id: cuid(),
                    billingEndAt: new Date(),
                    billingStartAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [],
                  }
                )

                const shipmentDate = rentalService.formatPackageShipmentDate(
                  timeUtils.xDaysAgo(29)
                )

                expect(lineItemDatas.length).toBe(1)
                expect(lineItemDatas[0].price).toBe(0)
                expect(lineItemDatas[0].name).toBe(
                  `Outbound package shipped ${shipmentDate}`
                )
                expect(lineItemDatas[0].comment).toBe(
                  "First shipped outbound package of previous billing cycle. Did not use premium shipping method. No charge."
                )
              })
            })

            describe("2nd or later package of previous billing cycle", () => {
              it("If it's select, creates a line item with nonzero price", async () => {
                const previousRentalInvoiceMock = jest
                  .spyOn(
                    rentalService,
                    "getPreviousRentalInvoiceWithPackageData"
                  )
                  .mockReturnValue({
                    id: cuid(),
                    billingStartAt: timeUtils.xDaysAgo(60),
                    billingEndAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [
                      {
                        outboundPackage: {
                          id: true,
                          amount: 2000,
                          createdAt: timeUtils.xDaysAgo(31),
                          enteredDeliverySystemAt: timeUtils.xDaysAgo(29),
                          shippingMethod: { code: "UPSSelect" },
                        },
                      },
                    ],
                    lineItems: [
                      {
                        name:
                          "First shipped outbound package of billing cycle. Did not use premium shipping method. No charge.",
                        price: 0,
                      },
                    ],
                  } as any)
                mocksToRestore.push(previousRentalInvoiceMock)
                const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
                  {
                    id: cuid(),
                    billingEndAt: new Date(),
                    billingStartAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [],
                  }
                )

                const shipmentDate = rentalService.formatPackageShipmentDate(
                  timeUtils.xDaysAgo(29)
                )
                expect(lineItemDatas.length).toBe(1)
                expect(lineItemDatas[0].price).toBeGreaterThan(0)
                expect(lineItemDatas[0].name).toBe(
                  `Outbound package shipped ${shipmentDate}`
                )
                expect(lineItemDatas[0].comment).toBe(
                  "Shipped outbound package 2 of previous billing cycle. Charge."
                )
              })
              it("If it's ground, creates a line item with nonzero price", async () => {
                const previousRentalInvoiceMock = jest
                  .spyOn(
                    rentalService,
                    "getPreviousRentalInvoiceWithPackageData"
                  )
                  .mockReturnValue({
                    id: cuid(),
                    billingStartAt: timeUtils.xDaysAgo(60),
                    billingEndAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [
                      {
                        outboundPackage: {
                          id: true,
                          amount: 2000,
                          createdAt: timeUtils.xDaysAgo(31),
                          enteredDeliverySystemAt: timeUtils.xDaysAgo(29),
                          shippingMethod: { code: "UPSGround" },
                        },
                      },
                    ],
                    lineItems: [
                      {
                        name:
                          "First shipped outbound package of billing cycle. Did not use premium shipping method. No charge.",
                        price: 0,
                      },
                      {
                        name:
                          "Shipped outbound package 2 of billing cycle. Charge.",
                        price: 2000,
                      },
                    ],
                  } as any)
                mocksToRestore.push(previousRentalInvoiceMock)
                const lineItemDatas = await rentalService.getOutboundPackageLineItemDatasFromPreviousBillingCycle(
                  {
                    id: cuid(),
                    billingEndAt: new Date(),
                    billingStartAt: timeUtils.xDaysAgo(30),
                    reservationPhysicalProducts: [],
                  }
                )

                const shipmentDate = rentalService.formatPackageShipmentDate(
                  timeUtils.xDaysAgo(29)
                )
                expect(lineItemDatas.length).toBe(1)
                expect(lineItemDatas[0].price).toBeGreaterThan(0)
                expect(lineItemDatas[0].name).toBe(
                  `Outbound package shipped ${shipmentDate}`
                )
                expect(lineItemDatas[0].comment).toBe(
                  "Shipped outbound package 3 of previous billing cycle. Charge."
                )
              })
            })
          })
        })
      })
    })
  })

  describe("Package discounts", () => {
    it("Discounts an outbound select package by 55%", () => {
      const rate = shipping.discountShippingRate(100, "UPSSelect", "Outbound")
      expect(rate).toBe(45)
    })

    it("Discounts an inbound select package by 55%", () => {
      const rate = shipping.discountShippingRate(100, "UPSSelect", "Inbound")
      expect(rate).toBe(45)
    })

    it("Discounts an inbound ground package by 38%", () => {
      const rate = shipping.discountShippingRate(100, "UPSGround", "Inbound")
      expect(rate).toBe(62)
    })
    it("Discounts an outbound ground package by 30%", () => {
      const rate = shipping.discountShippingRate(100, "UPSGround", "Outbound")
      expect(rate).toBe(70)
    })
  })
})
