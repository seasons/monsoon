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

describe("Price for items", () => {
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

  describe("No previous rental invoice", () => {
    beforeEach(async () => {
      await createTestCustomerWithRentalInvoices([
        {
          billingStartAt: timeUtils.xDaysAgoISOString(15),
          billingEndAt: new Date(),
          status: "Draft",
        },
      ])
    })

    it("If an item was not delivered (held for 0 days) do not apply the minimum", async () => {
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
          physicalProduct,
        },
        daysRented: 0,
      })

      expect(price).toBe(0)
      expect(appliedMinimum).toBe(false)
      expect(adjustedForPreviousMinimum).toBe(false)
    })

    it("If a customer has held an item for less than or equal to 12 days, apply the minimum", async () => {
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
          physicalProduct,
        },
        daysRented: 5,
      })

      const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
        physicalProduct,
        12
      )

      expect(price).toBe(expectedPrice)
      expect(appliedMinimum).toBe(true)
      expect(adjustedForPreviousMinimum).toBe(false)
    })

    it("If a customer has held an item for more than 12 days, charge them the prorated total", async () => {
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
          physicalProduct,
        },
        daysRented: 14,
      })

      const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
        physicalProduct,
        14
      )

      expect(price).toBe(expectedPrice)
      expect(appliedMinimum).toBe(false)
      expect(adjustedForPreviousMinimum).toBe(false)
    })
  })

  describe("Previous rental invoice where we have a line item for the given product", () => {
    beforeEach(async () => {
      await createTestCustomerWithRentalInvoices()
    })

    describe("We charged the minimum on the last invoice", () => {
      it("If an item was not delivered (held for 0 days) do not apply the minimum", async () => {
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
            physicalProduct,
          },
          daysRented: 0,
        })

        expect(price).toBe(0)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })

      it("If they held it for less than 12 days in the previous billing cycle, adjust the current charge for the difference in days", async () => {
        // e.g if they held it for 7 days in the last cycle, and 14 days in this cycle, only charge them for 14-5 or 9 days.
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 7,
        })

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
            physicalProduct,
          },
          daysRented: 14,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          9
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(true)
      })

      it("If they held it for exactly 12 days in the previous billing cycle, do not adjust the current charge", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 12,
        })

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
            physicalProduct,
          },
          daysRented: 14,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          14
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })
    })

    describe("We charged more than the minimum the last invoice", () => {
      it("If an item was not delivered (held for 0 days) do not apply the minimum", async () => {
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
            physicalProduct,
          },
          daysRented: 0,
        })

        expect(price).toBe(0)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })

      it("Charge them for exactly the number of days they held in this billing cycle", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 15,
        })

        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "ReturnProcessed",
            physicalProduct,
          },
          daysRented: 3,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          3
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })
    })

    describe("We charged 0 on the last invoice", () => {
      it("If a customer has held an item for less than or equal to 12 days, apply the minimum", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 0,
        })

        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "ReturnProcessed",
            physicalProduct,
          },
          daysRented: 3,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          12
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(true)
        expect(adjustedForPreviousMinimum).toBe(false)
      })

      it("If a customer has held an item for more than 12 days, charge them the prorated total", async () => {
        await addLineItemToInvoice({
          physicalProduct,
          invoiceId: previousInvoiceId,
          daysRented: 0,
        })

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
            physicalProduct,
          },
          daysRented: 18,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          18
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
      })
    })

    describe("Previous rental invoice where we have no line item for the given product", () => {
      it("If a customer has held an item for less than or equal to 12 days, apply the minimum", async () => {
        const {
          price,
          appliedMinimum,
          adjustedForPreviousMinimum,
        } = await rentalService.calculateRentalPrice({
          invoice: { id: currentInvoiceId },
          customer: testCustomer,
          reservationPhysicalProduct: {
            id: "1",
            status: "ReturnProcessed",
            physicalProduct,
          },
          daysRented: 3,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          12
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(true)
        expect(adjustedForPreviousMinimum).toBe(false)
      })

      it("If a customer has held an item for more than 12 days, charge them the prorated total", async () => {
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
            physicalProduct,
          },
          daysRented: 15,
        })

        const expectedPrice = rentalService.calculateUnadjustedPriceForDaysRented(
          physicalProduct,
          15
        )
        expect(price).toBe(expectedPrice)
        expect(appliedMinimum).toBe(false)
        expect(adjustedForPreviousMinimum).toBe(false)
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
        physicalProduct,
      },
      daysRented: 12,
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
