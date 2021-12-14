import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import cuid from "cuid"

import { PAYMENT_MODULE_DEF } from "../payment.module"
import { RentalService } from "../services/rental.service"
import { Prisma } from ".prisma/client"

let prisma: PrismaService
let rentalService: RentalService

describe("Calculate Rental Price", () => {
  let previousInvoiceId
  let currentInvoiceId
  let physicalProduct
  let timeUtils: TimeUtilsService
  let testUtils: TestUtilsService

  let utils: UtilsService
  let testCustomer

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(PAYMENT_MODULE_DEF)

    const moduleRef = await moduleBuilder.compile()

    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    utils = moduleRef.get<UtilsService>(UtilsService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    rentalService = moduleRef.get<RentalService>(RentalService)
  })

  const createTestCustomerWithRentalInvoices = async (
    lines?: Prisma.Enumerable<Prisma.RentalInvoiceCreateManyMembershipInput>
  ) => {
    previousInvoiceId = cuid()
    currentInvoiceId = cuid()

    const { customer } = await testUtils.createTestCustomer({
      create: {
        membership: {
          create: {
            subscriptionId: utils.randomString(),
            plan: { connect: { planID: "access-monthly" } },
            rentalInvoices: {
              createMany: {
                data: lines || [
                  {
                    id: previousInvoiceId,
                    billingStartAt: timeUtils.xDaysAgoISOString(35),
                    billingEndAt: timeUtils.xDaysAgoISOString(5),
                    status: "Billed",
                  },
                  {
                    id: currentInvoiceId,
                    billingStartAt: timeUtils.xDaysAgoISOString(4),
                    billingEndAt: new Date(),
                    status: "Draft",
                  },
                ],
              },
            },
          },
        },
      },
      select: { id: true },
    })

    testCustomer = customer
  }

  beforeEach(async () => {
    physicalProduct = await prisma.client.physicalProduct.findFirst({
      where: {
        inventoryStatus: "Reservable",
      },
      select: {
        id: true,
        productVariant: {
          select: {
            product: {
              select: {
                computedRentalPrice: true,
              },
            },
          },
        },
      },
    })
  })

  describe("No previous line item", () => {
    beforeEach(async () => {
      await createTestCustomerWithRentalInvoices([
        {
          billingStartAt: timeUtils.xDaysAgoISOString(15),
          billingEndAt: new Date(),
          status: "Draft",
        },
      ])
    })

    describe("Minimum amount applied is 0", () => {
      test("If the customer held it for 15 days, we bill him for 15 days", async () => {
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "AtHome",
            minimumAmountApplied: 0,
            physicalProduct: {
              id: physicalProduct.id,
              productVariant: { product: { computedRentalPrice: 30 } },
            },
          },
          daysRented: 15,
        })

        expect(price).toBe(1500)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })

      test("If the customer held it for 7 days, we bill for 12 and set appliedMinimum to true", async () => {
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "AtHome",
            minimumAmountApplied: 0,
            physicalProduct: {
              id: physicalProduct.id,
              productVariant: { product: { computedRentalPrice: 30 } },
            },
          },
          daysRented: 7,
        })

        expect(price).toBe(1200)
        expect(appliedMinimum).toBe(true)
        expect(adjustedForPreviousMinimum).toBe(false)
      })
    })

    describe("Minimum amount applied is greater than 0", () => {
      it("Adjusts the price by the minimum amount applied", async () => {
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "AtHome",
            minimumAmountApplied: 100,
            physicalProduct: {
              id: physicalProduct.id,
              productVariant: { product: { computedRentalPrice: 30 } },
            },
          },
          daysRented: 12,
        })

        expect(price).toBe(1100) // TODO:
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(true)
      })
    })
  })

  describe("Previous line item", () => {
    beforeEach(async () => {
      await createTestCustomerWithRentalInvoices()
    })
    describe("Item rented for more than 12 days in previous billing cycle", () => {
      test("We bill them directly for the number of days rented this cycle", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 13,
        })

        // Add a line item to the previous invoice
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "AtHome",
            minimumAmountApplied: 0,
            physicalProduct: {
              id: physicalProduct.id,
              productVariant: { product: { computedRentalPrice: 30 } },
            },
          },
          daysRented: 2,
        })

        expect(price).toBe(200)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })
    })

    describe("Item rented for fewer than 12 days in previous billing cycle", () => {
      test("If they held it for 5 days last cycle and 3 days this cycle, we charge them nothing now", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 5,
        })

        // Add a line item to the previous invoice
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "AtHome",
            minimumAmountApplied: 0,
            physicalProduct: {
              id: physicalProduct.id,
              productVariant: { product: { computedRentalPrice: 30 } },
            },
          },
          daysRented: 3,
        })

        expect(price).toBe(0)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(true)
      })

      test("If they held it for 5 days last cycle and 10 days this cycle, we charge them for 3 days", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 5,
        })

        // Add a line item to the previous invoice
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "AtHome",
            minimumAmountApplied: 0,
            physicalProduct: {
              id: physicalProduct.id,
              productVariant: { product: { computedRentalPrice: 30 } },
            },
          },
          daysRented: 10,
        })

        expect(price).toBe(300)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(true)
      })
    })
  })

  test("Return price of 0 for a Purchased item", async () => {
    await createTestCustomerWithRentalInvoices([
      {
        billingStartAt: timeUtils.xDaysAgoISOString(15),
        billingEndAt: new Date(),
        status: "Draft",
      },
    ])

    const {
      price,
      appliedMinimum,
      adjustedForPreviousMinimum,
    } = await rentalService.calculateRentalPrice({
      invoice: { id: currentInvoiceId },
      customer: testCustomer,
      reservationPhysicalProduct: {
        id: "1",
        status: "Purchased",
        minimumAmountApplied: 4000,
        physicalProduct,
      },
      daysRented: 12,
    })

    expect(price).toBe(0)
    expect(appliedMinimum).toBe(false)
    expect(adjustedForPreviousMinimum).toBe(false)
  })

  test("Return price of 0 for an item rented 0 days", async () => {
    await createTestCustomerWithRentalInvoices([
      {
        billingStartAt: timeUtils.xDaysAgoISOString(15),
        billingEndAt: new Date(),
        status: "Draft",
      },
    ])

    const {
      price,
      appliedMinimum,
      adjustedForPreviousMinimum,
    } = await rentalService.calculateRentalPrice({
      invoice: { id: currentInvoiceId },
      customer: testCustomer,
      reservationPhysicalProduct: {
        id: "1",
        status: "InTransitOutbound",
        minimumAmountApplied: 4000,
        physicalProduct,
      },
      daysRented: 0,
    })

    expect(price).toBe(0)
    expect(appliedMinimum).toBe(false)
    expect(adjustedForPreviousMinimum).toBe(false)
  })
})

const addLineItemToInvoice = async ({
  invoiceId,
  physicalProduct,
  daysRented,
}: {
  invoiceId: string
  physicalProduct: { id: string }
  daysRented: number
}) => {
  return await prisma.client.rentalInvoice.update({
    where: { id: invoiceId },
    data: {
      lineItems: {
        createMany: {
          data: [
            {
              physicalProductId: physicalProduct.id,
              daysRented: daysRented,
              price: rentalService.calculateUnadjustedPriceForDaysRented(
                physicalProduct,
                daysRented
              ),
              currencyCode: "USD",
            },
          ],
        },
      },
    },
  })
}
