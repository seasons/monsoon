import {
  expectTimeToEqual,
  setReservationStatus,
} from "@app/modules/Payment/tests/utils/utils"
import { ReservationPhysicalProductService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import cuid from "cuid"

import { ProductModuleDef } from "../product.module"

describe("Process Return", () => {
  let prismaService: PrismaService
  let resPhysProdService: ReservationPhysicalProductService
  let reserveService: ReserveService
  let testUtils: TestUtilsService
  let reservationTestUtil: ReservationTestUtilsService

  let testCustomer
  let cleanupFuncs = []
  let reservation
  let physicalProductsBeforeReturn
  let physicalProductsAfterReturn
  let resPhysProdsBeforeReturn
  let resPhysProdsAfterReturn
  let productVariantsBeforeReturn
  let productVariantsAfterReturn
  let bagItemsBeforeReturn
  let bagItemsAfterReturn
  let droppedOffBy
  let productStates
  let inboundPackage

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    resPhysProdService = moduleRef.get<ReservationPhysicalProductService>(
      ReservationPhysicalProductService
    )
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    reservationTestUtil = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
    const { cleanupFunc, customer } = await testUtils.createTestCustomer({
      select: {
        id: true,
        status: true,
        membership: { select: { plan: { select: { tier: true } } } },
        user: true,
      },
    })
    cleanupFuncs.push(cleanupFunc)
    testCustomer = customer
  })

  describe("Dropped off By UPS", () => {
    beforeAll(async () => {
      const {
        reservation,
        bagItems,
      } = await reservationTestUtil.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
      })
      await setReservationStatus(reservation.id, "Delivered", {
        prisma: prismaService,
      })

      resPhysProdsBeforeReturn = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            reservationId: reservation.id,
          },
          select: {
            id: true,
            status: true,
            hasReturnProcessed: true,
            droppedOffAt: true,
            droppedOffBy: true,
            inboundPackage: {
              select: {
                id: true,
                shippingLabel: {
                  select: {
                    trackingNumber: true,
                  },
                },
              },
            },
            physicalProduct: {
              select: {
                id: true,
                seasonsUID: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
            bagItem: {
              select: {
                id: true,
              },
            },
          },
        }
      )

      physicalProductsBeforeReturn = resPhysProdsBeforeReturn.map(
        a => a.physicalProduct
      )
      productVariantsBeforeReturn = physicalProductsBeforeReturn.map(
        a => a.productVariant
      )

      bagItemsBeforeReturn = resPhysProdsBeforeReturn.map(a => a.bagItem)

      productStates = physicalProductsBeforeReturn.map(a => {
        return {
          productUID: a.seasonsUID,
          returned: true,
          productStatus: "Dirty",
          notes: "Typical return notes here",
        }
      })

      droppedOffBy = "UPS"
      const transactionID = cuid()
      inboundPackage = prismaService.client.package.create({
        data: {
          transactionID,
        },
        select: {
          shippingLabel: {
            select: {
              trackingNumber: true,
            },
          },
        },
      })
      await resPhysProdService.processReturn({
        productStates,
        trackingNumber: inboundPackage.shippingLabel.trackingNumber,
        droppedOffBy,
        customerId: testCustomer.id,
      })
      resPhysProdsAfterReturn = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            reservationId: reservation.id,
          },
          select: {
            id: true,
            status: true,
            hasReturnProcessed: true,
            droppedOffAt: true,
            droppedOffBy: true,
            inboundPackage: {
              select: {
                id: true,
                shippingLabel: {
                  select: {
                    trackingNumber: true,
                  },
                },
              },
            },
            physicalProduct: {
              select: {
                id: true,
                seasonsUID: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
          },
        }
      )

      physicalProductsAfterReturn = resPhysProdsAfterReturn.map(
        a => a.physicalProduct
      )
      productVariantsAfterReturn = physicalProductsAfterReturn.map(
        a => a.productVariant
      )

      bagItemsAfterReturn = resPhysProdsAfterReturn.map(a => a.bagItem)
    })

    it("sets status to ReturnProcessed on reservationPhysicalProduct", async () => {
      resPhysProdsAfterReturn.map(a => expect(a.status).toBe("ReturnProcessed"))
    })

    it("sets hasReturnProcessed to true on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a => expect(a.hasReturnProcessed).toBe(true))
    })

    it("sets returnProcessedAt on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a =>
        expectTimeToEqual(a.returnProcessAt, new Date())
      )
    })

    it("sets inboundPackage on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a => expect(!!a.inboundPackage).toBe(true))
    })

    it("sets droppedOffBy to UPS on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a => expect(a.droppedOffBy).toBe("UPS"))
    })

    it("sets droppedOffAt on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a =>
        expectTimeToEqual(a.droppedOffAt, new Date())
      )
    })

    it("updates reservations status to Completed if status isn't set to Lost", async () => {
      const reservations = await prismaService.client.reservation.findMany({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: {
                in: resPhysProdsAfterReturn.map(a => a.id),
              },
            },
          },
        },
        select: {
          status: true,
        },
      })
      reservations.map(a => expect(a.status).toBe("Completed"))
    })

    it("deletes bagItems from customer's bag", () => {
      bagItemsAfterReturn.map(a => expect(a).toBeUndefined)
    })

    it("updates productVariant counts", () => {
      productVariantsAfterReturn.map((a, index) => {
        const productVariant = productVariantsBeforeReturn[index]
        expect(productVariant.nonReservable + 1).toBe(a.nonReservable)
        expect(productVariant.reserved - 1).toBe(a.reserved)
      })
    })

    it("sets productStatus to what is choosen (this case it's Dirty) on physicalProdut", () => {
      physicalProductsAfterReturn.map(a =>
        expect(a.productStatus).toBe("Dirty")
      )
    })

    it("sets inventoryStatus NonReservable on physicalProdut", () => {
      physicalProductsAfterReturn.map(a =>
        expect(a.inventoryStatus).toBe("NonReservable")
      )
    })
  })

  describe("Dropped off by Customer", () => {
    beforeAll(async () => {
      const {
        reservation,
        bagItems,
      } = await reservationTestUtil.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
      })
      await setReservationStatus(reservation.id, "Delivered", {
        prisma: prismaService,
      })

      resPhysProdsBeforeReturn = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            reservationId: reservation.id,
          },
          select: {
            id: true,
            status: true,
            hasReturnProcessed: true,
            droppedOffAt: true,
            droppedOffBy: true,
            inboundPackage: {
              select: {
                id: true,
                shippingLabel: {
                  select: {
                    trackingNumber: true,
                  },
                },
              },
            },
            physicalProduct: {
              select: {
                id: true,
                seasonsUID: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
            bagItem: {
              select: {
                id: true,
              },
            },
          },
        }
      )

      physicalProductsBeforeReturn = resPhysProdsBeforeReturn.map(
        a => a.physicalProduct
      )
      productVariantsBeforeReturn = physicalProductsBeforeReturn.map(
        a => a.productVariant
      )

      bagItemsBeforeReturn = resPhysProdsBeforeReturn.map(a => a.bagItem)

      productStates = physicalProductsBeforeReturn.map(a => {
        return {
          productUID: a.seasonsUID,
          returned: true,
          productStatus: "Dirty",
          notes: "Typical return notes here",
        }
      })

      droppedOffBy = "Customer"

      await resPhysProdService.processReturn({
        productStates,
        trackingNumber: "",
        droppedOffBy,
        customerId: testCustomer.id,
      })
      resPhysProdsAfterReturn = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            reservationId: reservation.id,
          },
          select: {
            id: true,
            status: true,
            hasReturnProcessed: true,
            droppedOffAt: true,
            droppedOffBy: true,
            inboundPackage: {
              select: {
                id: true,
                shippingLabel: {
                  select: {
                    trackingNumber: true,
                  },
                },
              },
            },
            physicalProduct: {
              select: {
                id: true,
                seasonsUID: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
          },
        }
      )

      physicalProductsAfterReturn = resPhysProdsAfterReturn.map(
        a => a.physicalProduct
      )
      productVariantsAfterReturn = physicalProductsAfterReturn.map(
        a => a.productVariant
      )

      bagItemsAfterReturn = resPhysProdsAfterReturn.map(a => a.bagItem)
    })
    it("sets status to ReturnProcessed on reservationPhysicalProduct", async () => {
      resPhysProdsAfterReturn.map(a => expect(a.status).toBe("ReturnProcessed"))
    })

    it("sets hasReturnProcessed to true on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a => expect(a.hasReturnProcessed).toBe(true))
    })

    it("sets returnProcessedAt on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a =>
        expectTimeToEqual(a.returnProcessAt, new Date())
      )
    })

    it("doesn't set inboundPackage on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a => expect(!!a.inboundPackage).toBe(false))
    })

    it("sets droppedOffBy to Customer on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a => expect(a.droppedOffBy).toBe("Customer"))
    })

    it("sets droppedOffAt on reservationPhysicalProduct", () => {
      resPhysProdsAfterReturn.map(a =>
        expectTimeToEqual(a.droppedOffAt, new Date())
      )
    })

    it("updates reservations status to Completed if status isn't set to Lost", async () => {
      const reservations = await prismaService.client.reservation.findMany({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: {
                in: resPhysProdsAfterReturn.map(a => a.id),
              },
            },
          },
        },
        select: {
          status: true,
        },
      })
      reservations.map(a => expect(a.status).toBe("Completed"))
    })

    it("deletes bagItems from customer's bag", () => {
      bagItemsAfterReturn.map(a => expect(a).toBeUndefined)
    })

    it("updates productVariant counts", () => {
      productVariantsAfterReturn.map((a, index) => {
        const productVariant = productVariantsBeforeReturn[index]
        expect(productVariant.nonReservable + 1).toBe(a.nonReservable)
        expect(productVariant.reserved - 1).toBe(a.reserved)
      })
    })

    it("sets productStatus to what is choosen (this case it's Dirty) on physicalProdut", () => {
      physicalProductsAfterReturn.map(a =>
        expect(a.productStatus).toBe("Dirty")
      )
    })

    it("sets inventoryStatus NonReservable on physicalProdut", () => {
      physicalProductsAfterReturn.map(a =>
        expect(a.inventoryStatus).toBe("NonReservable")
      )
    })
  })

  describe("Properly throws errors when right conditions aren't met", () => {
    let processReturn
    beforeAll(async () => {
      const {
        reservation,
        bagItems,
      } = await reservationTestUtil.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
      })
      await setReservationStatus(reservation.id, "Delivered", {
        prisma: prismaService,
      })

      resPhysProdsBeforeReturn = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            reservationId: reservation.id,
          },
          select: {
            id: true,
            status: true,
            hasReturnProcessed: true,
            droppedOffAt: true,
            droppedOffBy: true,
            inboundPackage: {
              select: {
                id: true,
                shippingLabel: {
                  select: {
                    trackingNumber: true,
                  },
                },
              },
            },
            physicalProduct: {
              select: {
                id: true,
                seasonsUID: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
            bagItem: {
              select: {
                id: true,
              },
            },
          },
        }
      )

      physicalProductsBeforeReturn = resPhysProdsBeforeReturn.map(
        a => a.physicalProduct
      )
      productVariantsBeforeReturn = physicalProductsBeforeReturn.map(
        a => a.productVariant
      )

      bagItemsBeforeReturn = resPhysProdsBeforeReturn.map(a => a.bagItem)

      productStates = physicalProductsBeforeReturn.map(a => {
        return {
          productUID: a.seasonsUID,
          returned: true,
          productStatus: "Dirty",
          notes: "Typical return notes here",
        }
      })
      processReturn = async (droppedOffBy, trackingNumber) => {
        await resPhysProdService.processReturn({
          productStates,
          droppedOffBy,
          trackingNumber,
          customerId: testCustomer.id,
        })
      }
    })
    it("throws an error when droppedOffBy is UPS but there is no trackingNumber", () => {
      expect(processReturn("UPS", "")).rejects.toThrowError(
        "Must specify return package tracking number when processing reservation"
      )
    })
  })
})
