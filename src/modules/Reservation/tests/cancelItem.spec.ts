import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test, TestingModule } from "@nestjs/testing"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationPhysicalProductService } from "../services/reservationPhysicalProduct.service"
import { ReservationTestUtilsService } from "./reservation.test.utils"
import { ReservationService } from ".."

describe("Cancel Item Mutation", () => {
  let prisma: PrismaService
  let testService: TestUtilsService
  let rppService: ReservationPhysicalProductService
  let reservationService: ReservationService
  let resTestUtils: ReservationTestUtilsService
  let testCustomer
  let bagItemIds
  let cancelItems
  let physProdsPreCancel
  let physProdsPostCancel
  let rppsPreCancel
  let rppsPostCancel
  let prodVariantsPreCancel
  let prodVariantsPostCancel

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()
    prisma = moduleRef.get<PrismaService>(PrismaService)
    rppService = moduleRef.get<ReservationPhysicalProductService>(
      ReservationPhysicalProductService
    )
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    resTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)

    const { customer } = await testService.createTestCustomer()
    testCustomer = customer

    cancelItems = async () => {
      await rppService.cancelItems({ bagItemIds })
    }
  })

  describe("Queued bagItems", () => {
    beforeEach(async () => {
      const {
        bagItems: _bagItems,
      } = await resTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
        options: {
          bagItemSelect: {
            id: true,
            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
              },
            },
            physicalProduct: {
              select: {
                id: true,
                inventoryStatus: true,
                productStatus: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                reservable: true,
                nonReservable: true,
                reserved: true,
              },
            },
          },
        },
      })

      bagItemIds = _bagItems.map(a => a.id)
      physProdsPreCancel = _bagItems.map(a => a.physicalProduct)
      prodVariantsPreCancel = _bagItems.map(a => a.productVariant)
      rppsPreCancel = _bagItems.map(a => a.reservationPhysicalProduct)

      await cancelItems()
      physProdsPostCancel = await prisma.client.physicalProduct.findMany({
        where: {
          id: {
            in: physProdsPreCancel.map(a => a.id),
          },
        },
        select: {
          inventoryStatus: true,
        },
      })

      prodVariantsPostCancel = await prisma.client.productVariant.findMany({
        where: {
          id: {
            in: prodVariantsPreCancel.map(a => a.id),
          },
        },
        select: {
          id: true,
          reserved: true,
          reservable: true,
          nonReservable: true,
        },
      })

      rppsPostCancel = await prisma.client.reservationPhysicalProduct.findMany({
        where: {
          id: {
            in: rppsPreCancel.map(a => a.id),
          },
        },
        select: {
          status: true,
        },
      })
    })

    it("sets the physicalProducts inventoryStatuses to Reservable if bagItem is queued", async () => {
      physProdsPostCancel.forEach(a => {
        expect(a.inventoryStatus).toBe("Reservable")
      })
    })

    it("sets proper productVariant counts if bagItem is queued", () => {
      prodVariantsPostCancel.forEach((a, idx) => {
        expect(a.reservable).toBe(prodVariantsPreCancel[idx].reservable + 1)
        expect(a.reserved).toBe(prodVariantsPreCancel[idx].reserved - 1)
      })
    })

    it("deletes the bagItems from customer's bag", async () => {
      const deletedBagItems = await prisma.client.bagItem.findMany({
        where: {
          id: {
            in: bagItemIds,
          },
        },
        select: {
          id: true,
        },
      })

      expect(deletedBagItems.length).toBe(0)
    })

    it("sets the RPP's status to cancelled", () => {
      rppsPostCancel.forEach(a => {
        expect(a.status).toBe("Cancelled")
      })
    })
  })

  describe("Picked or Packed bagItems", () => {
    beforeEach(async () => {
      const {
        bagItems: _bagItems,
      } = await resTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
        options: {
          bagItemSelect: {
            id: true,
            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
              },
            },
            physicalProduct: {
              select: {
                id: true,
                inventoryStatus: true,
                productStatus: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                reservable: true,
                nonReservable: true,
                reserved: true,
              },
            },
          },
        },
      })

      bagItemIds = _bagItems.map(a => a.id)
      physProdsPreCancel = _bagItems.map(a => a.physicalProduct)
      prodVariantsPreCancel = _bagItems.map(a => a.productVariant)
      rppsPreCancel = _bagItems.map(a => a.reservationPhysicalProduct)

      await rppService.pickItems({ bagItemIds })

      await cancelItems()
      physProdsPostCancel = await prisma.client.physicalProduct.findMany({
        where: {
          id: {
            in: physProdsPreCancel.map(a => a.id),
          },
        },
        select: {
          inventoryStatus: true,
        },
      })

      prodVariantsPostCancel = await prisma.client.productVariant.findMany({
        where: {
          id: {
            in: prodVariantsPreCancel.map(a => a.id),
          },
        },
        select: {
          id: true,
          reserved: true,
          reservable: true,
          nonReservable: true,
        },
      })

      rppsPostCancel = await prisma.client.reservationPhysicalProduct.findMany({
        where: {
          id: {
            in: rppsPreCancel.map(a => a.id),
          },
        },
        select: {
          status: true,
        },
      })
    })

    it("sets the physicalProduct inventoryStatuses to NonReservable if bagItem is pick or packed", () => {
      physProdsPostCancel.forEach(a => {
        expect(a.inventoryStatus).toBe("NonReservable")
      })
    })

    it("sets proper productVariant counts if bagItem is picked or packed", () => {
      prodVariantsPostCancel.forEach((a, idx) => {
        expect(a.nonReservable).toBe(
          prodVariantsPreCancel[idx].nonReservable + 1
        )
        expect(a.reserved).toBe(prodVariantsPreCancel[idx].reserved - 1)
      })
    })
    it("deletes the bagItems from customer's bag", async () => {
      const deletedBagItems = await prisma.client.bagItem.findMany({
        where: {
          id: {
            in: bagItemIds,
          },
        },
        select: {
          id: true,
        },
      })

      expect(deletedBagItems.length).toBe(0)
    })

    it("sets the RPP's status to cancelled", () => {
      rppsPostCancel.forEach(a => {
        expect(a.status).toBe("Cancelled")
      })
    })
  })
})
