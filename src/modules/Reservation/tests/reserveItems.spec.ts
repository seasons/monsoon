import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { BagService } from "@app/modules/Product/services/bag.service"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Prisma } from "@prisma/client"
import chargebee from "chargebee"
import cuid from "cuid"
import { head, merge } from "lodash"

import { ProcessableRentalInvoiceArgs } from "../../Payment/services/rental.service"
import { ReservationModuleRef } from "../reservation.module"
import { ReservationTestUtilsService } from "./reservation.test.utils"

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

let prisma: PrismaService
let reserveService: ReserveService
let shippingService: ShippingService
let reservationTestUtils: ReservationTestUtilsService
let testUtils: TestUtilsService
let bagService: BagService
let testCustomer: any

const reservationSelect = Prisma.validator<Prisma.ReservationSelect>()({
  reservationNumber: true,
  reservationPhysicalProducts: {
    select: {
      isNew: true,
      outboundPackage: { select: { id: true } },
      inboundPackage: { select: { id: true } },
      physicalProduct: {
        select: { seasonsUID: true, inventoryStatus: true, id: true },
      },
    },
  },
  sentPackage: { select: { id: true } },
  returnPackages: { select: { id: true } },
})

const testCustomerSelect = Prisma.validator<Prisma.CustomerSelect>()({
  membership: {
    select: {
      rentalInvoices: {
        select: {
          id: true,
          reservationPhysicalProducts: {
            select: {
              id: true,
              physicalProduct: {
                select: { productVariant: { select: { sku: true } } },
              },
            },
          },
        },
      },
    },
  },
})
describe("Reserve Items", () => {
  let reservation

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(ReservationModuleRef)
    moduleBuilder.overrideProvider(PaymentService).useClass(PaymentServiceMock)

    const moduleRef = await moduleBuilder.compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    shippingService = moduleRef.get<ShippingService>(ShippingService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    bagService = moduleRef.get<BagService>(BagService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )

    jest
      .spyOn<any, any>(shippingService, "shippoValidateAddress")
      .mockReturnValue({ isValid: true, code: "", message: "" })
    jest
      .spyOn(chargebee.invoice, "create")
      .mockImplementation(({ customer_id, currency_code, charges }) => {
        return {
          request: () => {
            return { invoice: { status: "paid", id: "yoyo" } }
          },
        }
      })
  })

  describe("Core functionality works", () => {
    let bagItemsBeforeReservation
    let bagItemsAfterReservation
    let productVariantsBeforeReservationBySKU
    let productVariantsAfterReservationBySKU
    let custWithDataBeforeReservation
    let custWithDataAfterReservation

    beforeAll(async () => {
      const { customer } = await testUtils.createTestCustomer({
        select: testCustomerSelect,
      })
      testCustomer = customer

      const productVariantsBeforeReservation = await prisma.client.productVariant.findMany(
        {
          where: { reservable: { gt: 0 } },
          take: 2,
          select: {
            id: true,
            sku: true,
            reservable: true,
            total: true,
            reserved: true,
          },
        }
      )
      const bagItem1 = await bagService.addToBag(
        productVariantsBeforeReservation[0].id,
        customer,
        { id: true }
      )
      const bagItem2 = await bagService.addToBag(
        productVariantsBeforeReservation[1].id,
        customer,
        { id: true }
      )
      bagItemsBeforeReservation = [bagItem1, bagItem2]
      productVariantsBeforeReservationBySKU = productVariantsBeforeReservation.reduce(
        (acc, curval) => {
          acc[curval.sku] = curval
          return acc
        },
        {}
      )
      custWithDataBeforeReservation = await getCustWithData()

      reservation = await reserveService.reserveItems({
        shippingCode: "UPSGround",
        customer: testCustomer as any,
        select: reservationSelect,
      })

      const productVariantsAfterReservation = await prisma.client.productVariant.findMany(
        {
          where: {
            sku: { in: productVariantsBeforeReservation.map(a => a.sku) },
          },
          select: { total: true, sku: true, reservable: true, reserved: true },
        }
      )
      bagItemsAfterReservation = await prisma.client.bagItem.findMany({
        where: { id: { in: bagItemsBeforeReservation.map(a => a.id) } },
        select: {
          status: true,
          productVariant: {
            select: {
              sku: true,
              physicalProducts: { select: { seasonsUID: true } },
            },
          },
          physicalProduct: { select: { seasonsUID: true, id: true } },
          reservationPhysicalProduct: {
            select: {
              id: true,
              physicalProduct: { select: { seasonsUID: true } },
            },
          },
        },
      })

      productVariantsAfterReservationBySKU = productVariantsAfterReservation.reduce(
        (acc, curval) => {
          acc[curval.sku] = curval
          return acc
        },
        {}
      )
      custWithDataAfterReservation = await getCustWithData()
    })

    it("Properly updates counts on product variants", () => {
      expect(Object.keys(productVariantsBeforeReservationBySKU).length).toBe(2)
      expect(Object.keys(productVariantsAfterReservationBySKU).length).toBe(2)

      const skus = Object.keys(productVariantsBeforeReservationBySKU)
      for (const sku of skus) {
        expect(productVariantsBeforeReservationBySKU[sku].total).toBe(
          productVariantsAfterReservationBySKU[sku].total
        )
        expect(productVariantsBeforeReservationBySKU[sku].reservable).toBe(
          productVariantsAfterReservationBySKU[sku].reservable + 1
        )
        expect(productVariantsBeforeReservationBySKU[sku].reserved).toBe(
          productVariantsAfterReservationBySKU[sku].reserved - 1
        )
      }
    })

    it("Marks the relevant physical products as Reserved", () => {
      const reservedPhysicalProducts = reservation.reservationPhysicalProducts.map(
        a => a.physicalProduct
      )
      expect(reservedPhysicalProducts.length).toBe(2)
      expect(reservedPhysicalProducts[0].inventoryStatus).toBe("Reserved")
      expect(reservedPhysicalProducts[1].inventoryStatus).toBe("Reserved")
    })

    it("Marks the relevant bag items as reserved", () => {
      expect(bagItemsBeforeReservation.length).toBe(2)
      expect(bagItemsAfterReservation.length).toBe(2)
      expect(bagItemsAfterReservation[0].status).toBe("Reserved")
      expect(bagItemsAfterReservation[1].status).toBe("Reserved")
    })

    it("Creates the ReservationPhysicalProduct records and connects them to the Reservation record", () => {
      const reservationPhysicalProducts =
        reservation.reservationPhysicalProducts
      expect(reservationPhysicalProducts.length).toBe(2)
      expect(reservationPhysicalProducts.every(a => a.isNew)).toBe(true)
      expect(
        reservationPhysicalProducts.every(a => !!a.physicalProduct?.id)
      ).toBe(true)
    })

    it("Connects the right ReservationPhysicalProduct and PhysicalProduct to each bag item", () => {
      expect(
        bagItemsAfterReservation.every(a => !!a.reservationPhysicalProduct?.id)
      ).toBe(true)
      expect(bagItemsAfterReservation.every(a => !!a.physicalProduct?.id)).toBe(
        true
      )

      for (const bi of bagItemsAfterReservation) {
        expect(
          bi.productVariant.physicalProducts
            .map(a => a.seasonsUID)
            .includes(bi.physicalProduct.seasonsUID)
        ).toBe(true)
        expect(bi.physicalProduct.seasonsUID).toBe(
          bi.reservationPhysicalProduct.physicalProduct.seasonsUID
        )
      }
    })

    it("Properly updates rental invoice for customer", () => {
      const rentalInvoiceBeforeReservation =
        custWithDataBeforeReservation.membership.rentalInvoices[0]
      expect(
        rentalInvoiceBeforeReservation.reservationPhysicalProducts.length
      ).toBe(0)
      expect(rentalInvoiceBeforeReservation.reservations.length).toBe(0)

      const rentalInvoiceAfterReservation =
        custWithDataAfterReservation.membership.rentalInvoices[0]
      expect(
        rentalInvoiceAfterReservation.reservationPhysicalProducts.length
      ).toBe(2)
      expect(rentalInvoiceAfterReservation.reservations.length).toBe(1)
    })

    it("Does not create outbound or inbound packages on initial reserve", () => {
      expect(
        reservation.reservationPhysicalProducts.every(a => !a.outboundPackage)
      ).toBe(true)
      expect(
        reservation.reservationPhysicalProducts.every(a => !a.inboundPackage)
      ).toBe(true)
      expect(reservation.sentPackage).toBe(null)
      expect(reservation.returnPackages.length).toBe(0)
    })
  })

  describe("Charges 40% upon reservation", () => {
    describe("Works as expected in simple case", () => {
      let billedCharges: Array<any>
      let prod1, prod2
      let rpp1, rpp2

      beforeAll(async () => {
        const mock = jest
          .spyOn(chargebee.invoice, "create")
          .mockImplementation(({ customer_id, currency_code, charges }) => {
            billedCharges = charges
            return {
              request: () => {
                return { invoice: { status: "paid", id: cuid() } }
              },
            }
          })
        const { customer } = await testUtils.createTestCustomer()
        const bagItems = await reservationTestUtils.addToBag(customer, 2)
        await prisma.client.bagItem.updateMany({
          where: { id: { in: bagItems.map(a => a.id) } },
          data: { status: "Reserved" },
        })
        const bagItemsToReserve = await reservationTestUtils.addToBag(
          customer,
          2,
          {
            id: true,
            productVariant: {
              select: { product: { select: { id: true, name: true } } },
            },
          }
        )
        prod1 = bagItemsToReserve[0].productVariant.product
        prod2 = bagItemsToReserve[1].productVariant.product
        await prisma.client.product.update({
          where: { id: prod1.id },
          data: { computedRentalPrice: 30 },
        })
        await prisma.client.product.update({
          where: { id: prod2.id },
          data: { computedRentalPrice: 50 },
        })

        const r = await reserveService.reserveItems({
          customer,
          shippingCode: "UPSGround",
          select: { id: true },
        })
        const rpps = await prisma.client.reservationPhysicalProduct.findMany({
          where: { reservation: { id: r.id } },
          select: {
            minimumAmountApplied: true,
            physicalProduct: {
              select: {
                productVariant: {
                  select: { product: { select: { name: true } } },
                },
              },
            },
          },
        })
        rpp1 = rpps.find(
          a => a.physicalProduct.productVariant.product.name === prod1.name
        )
        rpp2 = rpps.find(
          a => a.physicalProduct.productVariant.product.name === prod2.name
        )

        mock.mockRestore()
      })

      it("Only creates charges for new items", () => {
        expect(billedCharges.length).toBe(2)
      })

      it("Creates chargebee charges properly", () => {
        const prod1Charge = billedCharges.find(a =>
          a.description.includes(prod1.name)
        )
        expect(prod1Charge).toBeDefined()
        expect(prod1Charge.amount).toBe(1200)
        const prod2Charge = billedCharges.find(a =>
          a.description.includes(prod2.name)
        )
        expect(prod2Charge).toBeDefined()
        expect(prod2Charge.amount).toBe(2000)
      })

      it("Sets the minimumAmountApplied on the RPPs", () => {
        expect(rpp1.minimumAmountApplied).toBe(1200)
        expect(rpp2.minimumAmountApplied).toBe(2000)
      })
    })

    describe("If a customer reserves two variants of the same product, it works", () => {
      let billedCharges: Array<any>
      let rpp1, rpp2

      beforeAll(async () => {
        const mock = jest
          .spyOn(chargebee.invoice, "create")
          .mockImplementation(({ customer_id, currency_code, charges }) => {
            billedCharges = charges
            return {
              request: () => {
                return { invoice: { status: "paid", id: cuid() } }
              },
            }
          })
        const { customer } = await testUtils.createTestCustomer()
        let keepLooping = true
        let prodWithTwoVariantsAvaiable
        let ignoreIds = []
        while (keepLooping) {
          const prod = await prisma.client.product.findFirst({
            where: {
              id: { notIn: ignoreIds },
              variants: { some: { reservable: { gt: 0 } } },
            },
            select: {
              id: true,
              name: true,
              variants: { select: { reservable: true, id: true } },
            },
          })
          const hasTwoVariantsReservable =
            prod.variants.filter(a => a.reservable > 0).length >= 2

          if (hasTwoVariantsReservable) {
            keepLooping = false
            prodWithTwoVariantsAvaiable = prod
          } else if (!prod) {
            throw new Error("Unable to find a product with two variants")
          } else {
            ignoreIds.push(prod.id)
          }
        }

        const prodVars = prodWithTwoVariantsAvaiable.variants.filter(
          a => a.reservable > 0
        )
        await bagService.addToBag(prodVars[0].id, customer)
        await bagService.addToBag(prodVars[1].id, customer)

        await prisma.client.product.update({
          where: { id: prodWithTwoVariantsAvaiable.id },
          data: { computedRentalPrice: 100 },
        })

        const r = await reserveService.reserveItems({
          customer,
          shippingCode: "UPSGround",
          select: { id: true },
        })

        const rpps = await prisma.client.reservationPhysicalProduct.findMany({
          where: { reservation: { id: r.id } },
          select: {
            minimumAmountApplied: true,
            physicalProduct: {
              select: {
                productVariant: {
                  select: { product: { select: { name: true } } },
                },
              },
            },
          },
        })
        rpp1 = rpps[0]
        rpp2 = rpps[1]

        mock.mockRestore()
      })

      it("Only creates charges for new items", () => {
        expect(billedCharges.length).toBe(2)
      })

      it("Creates chargebee charges properly", () => {
        expect(billedCharges[0].amount).toBe(4000)
        expect(billedCharges[1].amount).toBe(4000)
      })

      it("Sets the minimumAmountApplied on the RPPs", () => {
        expect(rpp1.minimumAmountApplied).toBe(4000)
        expect(rpp2.minimumAmountApplied).toBe(4000)
      })
    })
    it("If it errors, we call the proper error", async () => {
      const invoiceCreateMock = jest
        .spyOn(chargebee.invoice, "create")
        .mockImplementation(({ customer_id, currency_code, charges }) => {
          return {
            request: () => {
              throw "Test Error"
            },
          }
        })
      const voidInvoiceMock = jest.spyOn(chargebee.invoice, "void_invoice")
      const { customer } = await testUtils.createTestCustomer()
      await reservationTestUtils.addToBag(customer, 2)

      // Set the computed Rental prices on bag items so we can predict the charges
      let expectedError
      try {
        await reserveService.reserveItems({
          customer,
          shippingCode: "UPSGround",
          select: { id: true },
        })
      } catch (err) {
        expectedError = err
      }
      expect(expectedError).toBeDefined()
      expect(expectedError.message).toBe(
        "Unable to charge minimum for reservation"
      )
      expect(voidInvoiceMock).toBeCalledTimes(0)

      invoiceCreateMock.mockRestore()
      voidInvoiceMock.mockRestore()
    })

    it("If creating the invoice doesn't return successful status, we throw the error and void the invoice", async () => {
      const invoiceCreateMock = jest
        .spyOn(chargebee.invoice, "create")
        .mockImplementation(({ customer_id, currency_code, charges }) => {
          return {
            request: () => {
              return { invoice: { status: "not_success", id: "yoyo" } }
            },
          }
        })
      const voidInvoiceMock = jest
        .spyOn(chargebee.invoice, "void_invoice")
        .mockImplementation(() => {
          return { request: () => null }
        })
      const { customer } = await testUtils.createTestCustomer()
      await reservationTestUtils.addToBag(customer, 2)

      // Set the computed Rental prices on bag items so we can predict the charges
      let expectedError
      try {
        await reserveService.reserveItems({
          customer,
          shippingCode: "UPSGround",
          select: { id: true },
        })
      } catch (err) {
        expectedError = err
      }
      expect(expectedError).toBeDefined()
      expect(expectedError.message).toBe(
        "Unable to charge minimum for reservation"
      )
      expect(voidInvoiceMock).toBeCalledTimes(1)

      invoiceCreateMock.mockRestore()
      voidInvoiceMock.mockRestore()
    })
  })

  /*
  - Does not let someone without an active rental invoice reserve
  */
})

const getCustWithData = async (
  select: Prisma.CustomerSelect = {}
): Promise<any> => {
  const defaultSelect = {
    membership: {
      select: {
        rentalInvoices: {
          select: ProcessableRentalInvoiceArgs.select,
        },
      },
    },
  }

  return await prisma.client.customer.findFirst({
    where: { id: testCustomer.id },
    select: merge(defaultSelect, select),
  })
}
