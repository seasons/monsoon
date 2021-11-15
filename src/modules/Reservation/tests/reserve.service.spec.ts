import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { BagService } from "@app/modules/Product/services/bag.service"
import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Prisma } from "@prisma/client"
import { head, merge } from "lodash"

import { ProcessableRentalInvoiceSelect } from "../../Payment/services/rental.service"
import { RESERVATION_MODULE_DEF } from "../reservation.module"

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

let prisma: PrismaService
let reserveService: ReserveService
let shippingService: ShippingService
let utils: UtilsService
let timeUtils: TimeUtilsService
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
describe("Reserve Service", () => {
  let reservation

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(RESERVATION_MODULE_DEF)
    moduleBuilder.overrideProvider(PaymentService).useClass(PaymentServiceMock)

    const moduleRef = await moduleBuilder.compile()

    prisma = moduleRef.get<PrismaService>(PrismaService)
    utils = moduleRef.get<UtilsService>(UtilsService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    shippingService = moduleRef.get<ShippingService>(ShippingService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    bagService = moduleRef.get<BagService>(BagService)

    jest
      .spyOn<any, any>(shippingService, "shippoValidateAddress")
      .mockReturnValue({ isValid: true, code: "", message: "" })
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

  /*
  - Does not let someone without an active rental invoice reserve

  - Leaves last reservation alone 


  */
})

const getCustWithData = async (
  select: Prisma.CustomerSelect = {}
): Promise<any> => {
  const defaultSelect = {
    membership: {
      select: {
        rentalInvoices: {
          select: ProcessableRentalInvoiceSelect,
        },
      },
    },
  }

  return await prisma.client.customer.findFirst({
    where: { id: testCustomer.id },
    select: merge(defaultSelect, select),
  })
}
