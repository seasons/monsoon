import { APP_MODULE_DEF } from "@app/app.module"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { ReservationService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import {
  PhysicalProduct,
  Prisma,
  RentalInvoiceLineItem,
  ReservationStatus,
  ShippingCode,
  ShippingOption,
} from "@prisma/client"
import chargebee from "chargebee"
import { head, merge } from "lodash"
import moment from "moment"

import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../../Payment/services/rental.service"
import { RESERVATION_MODULE_DEF } from "../reservation.module"

class PaymentServiceMock {
  addEarlySwapCharge = async () => null
  addShippingCharge = async () => {}
}

let prisma: PrismaService
let reserveService: ReserveService
let reservationService: ReservationService
let shippingService: ShippingService
let utils: UtilsService
let timeUtils: TimeUtilsService
let testCustomer: any

const reservationSelect = Prisma.validator<Prisma.ReservationSelect>()({
  reservationNumber: true,
  reservationPhysicalProducts: {
    select: {
      isNew: true,
      outboundPackage: { select: { id: true } },
      inboundPackage: { select: { id: true } },
      physicalProduct: { select: { seasonsUID: true, inventoryStatus: true } },
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
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    shippingService = moduleRef.get<ShippingService>(ShippingService)

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
      const { customer } = await createTestCustomer({
        select: testCustomerSelect,
      })
      testCustomer = customer

      bagItemsBeforeReservation = await addToBagForCustomer(2)
      const productVariantsBeforeReservation = bagItemsBeforeReservation.map(
        a => a.productVariant
      )
      productVariantsBeforeReservationBySKU = productVariantsBeforeReservation.reduce(
        (acc, curval) => {
          acc[curval.sku] = curval
          return acc
        },
        {}
      )
      custWithDataBeforeReservation = await getCustWithData()

      reservation = await reserveService.reserveItems(
        "UPSGround",
        testCustomer as any,
        reservationSelect
      )

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
          reservationPhysicalProduct: { select: { id: true } },
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

    it("Properly updates status on physical products", () => {
      const reservedPhysicalProducts = reservation.reservationPhysicalProducts.map(
        a => a.physicalProduct
      )
      expect(reservedPhysicalProducts.length).toBe(2)
      expect(reservedPhysicalProducts[0].inventoryStatus).toBe("Reserved")
      expect(reservedPhysicalProducts[1].inventoryStatus).toBe("Reserved")
    })

    it("Properly updates statuses on bag items", () => {
      expect(bagItemsBeforeReservation.length).toBe(2)
      expect(bagItemsAfterReservation.length).toBe(2)
      expect(bagItemsAfterReservation[0].status).toBe("Reserved")
      expect(bagItemsAfterReservation[1].status).toBe("Reserved")
    })

    it("Properly connects and initalizes ReservationPhysicalProducts", () => {
      const reservationPhysicalProducts =
        reservation.reservationPhysicalProducts
      expect(reservationPhysicalProducts.length).toBe(2)
      expect(reservationPhysicalProducts.every(a => a.isNew)).toBe(true)
      expect(
        reservationPhysicalProducts.every(
          a => a.inboundPackage?.id === undefined
        )
      ).toBe(true)
      expect(
        reservationPhysicalProducts.every(
          a => a.outboundPackage?.id === undefined
        )
      ).toBe(true)
      expect(
        reservationPhysicalProducts.every(a => !!a.physicalProduct?.id)
      ).toBe(true)
    })

    it("Connects ReservationPhysicalProduct records to BagItems", () => {
      expect(
        bagItemsAfterReservation.every(a => !!a.reservationPhysicalProduct?.id)
      ).toBe(true)
    })

    it("Properly updates rental invoice for customer", () => {
      const productsOnRentalInvoiceBeforeReservation =
        custWithDataBeforeReservation.membership.rentalInvoices[0].products
      expect(productsOnRentalInvoiceBeforeReservation.length).toBe(0)
      const productsOnRentalInvoiceAfterResevation =
        custWithDataAfterReservation.membership.rentalInvoices[0].products
      expect(productsOnRentalInvoiceAfterResevation.length).toBe(2)
    })

    it("Does not create outbound or inbound packages on initial reserve", () => {
      expect(
        reservation.reservationPhysicalProducts.every(a => !a.outboundPackage)
      ).toBe(true)
      expect(
        reservation.reservationPhysicalProducts.every(a => !a.inboundPackage)
      ).toBe(true)
      expect(reservation.sentPackage).toBe(undefined)
      expect(reservation.returnPackages.length).toBe(0)
    })
  })

  /*
  - Does not let someone without an active rental invoice reserve

  - Leaves last reservation alone 


  */
})

const createTestCustomer = async ({
  create = {},
  select = { id: true },
}: {
  create?: Partial<Prisma.CustomerCreateInput>
  select?: Prisma.CustomerSelect
} = {}) => {
  const upsGroundMethod = await prisma.client.shippingMethod.findFirst({
    where: { code: "UPSGround" },
  })
  const upsSelectMethod = await prisma.client.shippingMethod.findFirst({
    where: { code: "UPSSelect" },
  })
  const chargebeeSubscriptionId = utils.randomString()
  const defaultCreateData = {
    status: "Active",
    user: {
      create: {
        auth0Id: utils.randomString(),
        email: utils.randomString() + "@seasons.nyc",
        firstName: utils.randomString(),
        lastName: utils.randomString(),
      },
    },
    detail: {
      create: {
        shippingAddress: {
          create: {
            address1: "55 Washingston St",
            city: "Brooklyn",
            state: "NY",
            zipCode: "11201",
            shippingOptions: {
              create: [
                {
                  shippingMethod: { connect: { id: upsGroundMethod.id } },
                  externalCost: 10,
                },
                {
                  shippingMethod: { connect: { id: upsSelectMethod.id } },
                  externalCost: 20,
                },
              ],
            },
          },
        },
      },
    },
    membership: {
      create: {
        subscriptionId: chargebeeSubscriptionId,
        plan: { connect: { planID: "access-monthly" } },
        rentalInvoices: {
          create: {
            billingStartAt: timeUtils.xDaysAgoISOString(30),
            billingEndAt: new Date(),
          },
        },
        subscription: {
          create: {
            planID: "access-monthly",
            subscriptionId: chargebeeSubscriptionId,
            currentTermStart: timeUtils.xDaysAgoISOString(1),
            currentTermEnd: timeUtils.xDaysFromNowISOString(1),
            nextBillingAt: timeUtils.xDaysFromNowISOString(1),
            status: "Active",
            planPrice: 2000,
          },
        },
      },
    },
  }
  const createData = merge(defaultCreateData, create)
  const customer = await prisma.client.customer.create({
    data: createData,
    select: merge(select, { id: true }),
  })
  const cleanupFunc = async () =>
    prisma.client.customer.delete({ where: { id: customer.id } })
  return { cleanupFunc, customer }
}

const addToBagForCustomer = async numProductsToAdd => {
  let bagItemsToReturn = []
  const reservedBagItems = await prisma.client.bagItem.findMany({
    where: {
      customer: { id: testCustomer.id },
      status: "Reserved",
      saved: false,
    },
    select: {
      productVariant: {
        select: { sku: true, product: { select: { id: true } } },
      },
    },
  })
  const reservedSKUs = reservedBagItems.map(a => a.productVariant.sku)
  const reservedProductIds = reservedBagItems.map(
    b => b.productVariant.product.id
  )
  let reservableProdVars = []
  let reservableProductIds = []
  for (let i = 0; i < numProductsToAdd; i++) {
    const nextProdVar = await prisma.client.productVariant.findFirst({
      where: {
        reservable: { gte: 1 },
        sku: { notIn: reservedSKUs },
        // Ensure we reserve diff products each time. Needed for some tests
        product: {
          id: { notIn: [...reservedProductIds, ...reservableProductIds] },
        },
        // We shouldn't need to check this since we're checking counts,
        // but there's some corrupt data so we do this to circumvent that.
        physicalProducts: { some: { inventoryStatus: "Reservable" } },
      },
      take: numProductsToAdd,
      select: {
        id: true,
        productId: true,
      },
    })
    reservableProdVars.push(nextProdVar)
    reservableProductIds.push(nextProdVar.productId)
  }
  for (const prodVar of reservableProdVars) {
    const bi = await prisma.client.bagItem.create({
      data: {
        customer: { connect: { id: testCustomer.id } },
        productVariant: { connect: { id: prodVar.id } },
        status: "Added",
        saved: false,
      },
      select: {
        productVariant: {
          select: { sku: true, total: true, reservable: true, reserved: true },
        },
      },
    })
    bagItemsToReturn.push(bi)
  }
  return bagItemsToReturn
}

const getCustWithData = async (
  select: Prisma.CustomerSelect = {}
): Promise<any> => {
  const defaultSelect = {
    membership: {
      select: {
        rentalInvoices: {
          select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
        },
      },
    },
  }

  return await prisma.client.customer.findFirst({
    where: { id: testCustomer.id },
    select: merge(defaultSelect, select),
  })
}
