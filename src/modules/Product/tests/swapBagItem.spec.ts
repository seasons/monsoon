import { ReservationService } from "@app/modules/Reservation"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing" //compiles nestjs env
import { intersection } from "lodash"

import { ProductModuleDef } from "../product.module"
import { BagService } from "../services/bag.service"
import { prisma } from ".prisma/client"

describe("Swap Bag Item", () => {
  let prismaService: PrismaService
  let reservationService: ReservationService
  let utilsService: UtilsService
  let bagService: BagService
  let testUtils: TestUtilsService
  let cleanupFuncs = []
  let testCustomer: any
  let reservation
  let bagItem

  //create test customer
  //create res (call reserve items function)
  //pick one item on that res
  //swap the pick item, then swap non picked item (call swap bag item function)

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    utilsService = moduleRef.get<UtilsService>(UtilsService)
    bagService = moduleRef.get<BagService>(BagService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
  })

  beforeEach(async () => {
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

    const result = await testUtils.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 1,
      options: { shippingCode: "UPSGround" },
    })

    reservation = result.reservation
    bagItem = result.bagItems?.[0]
  })

  describe("Properly swaps item that has not been picked", () => {
    //old bag item tests
    it("old bag item product variant counts have been updated", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const oldProductVariant = await prismaService.client.productVariant.findFirst(
        {
          where: {
            id: bagItem.productVariantId,
          },
          select: {
            reservable: true,
            reserved: true,
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )

      expect(oldProductVariant.reservable).toBe(
        result.productVariant.reservable - 1
      )
    }) //check

    it("old bag item has been deleted", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      await bagService.swapBagItem(bagItem.id, newPhysicalProduct.seasonsUID, {
        id: true,
        productVariant: {
          select: {
            reserved: true,
            reservable: true,
          },
        },
      })

      const oldBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItem.id,
        },
      })

      expect(oldBagItem).toBe(null)
    }) //check

    it("old reservationPhysicalProduct has been deleted", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const oldBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItem.id,
        },
        select: {
          reservationPhysicalProductId: true,
        },
      })

      await bagService.swapBagItem(bagItem.id, newPhysicalProduct.seasonsUID, {
        id: true,
        productVariant: {
          select: {
            reserved: true,
            reservable: true,
          },
        },
      })

      const oldReservationPhysicalProduct = await prismaService.client.reservationPhysicalProduct.findUnique(
        {
          where: {
            id: oldBagItem.reservationPhysicalProductId,
          },
        }
      )

      expect(oldReservationPhysicalProduct).toBe(null)
    }) //check

    it("inventory status for old physicalProduct has been updated to reservable", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const oldBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItem.id,
        },
        select: {
          physicalProduct: {
            select: {
              id: true,
              inventoryStatus: true,
            },
          },
        },
      })

      await bagService.swapBagItem(bagItem.id, newPhysicalProduct.seasonsUID, {
        id: true,
        productVariant: {
          select: {
            reserved: true,
            reservable: true,
          },
        },
      })

      const oldPhysicalProduct = await prismaService.client.physicalProduct.findUnique(
        {
          where: {
            id: oldBagItem.physicalProduct.id,
          },
        }
      )

      expect(oldPhysicalProduct.inventoryStatus).toBe("Reservable")
    }) //check

    //new bag item tests
    it("new bag item product variant counts have been updated", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
          select: {
            seasonsUID: true,
            productVariant: {
              select: {
                id: true,
                reservable: true,
                reserved: true,
              },
            },
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )

      expect(newPhysicalProduct.productVariant.reservable).toBe(
        result.productVariant.reservable + 1
      )
    }) //check

    it("new bag item has been upserted", async () => {
      //test to see if the correct productVariant, physicalProduct, reservationPhysProd, customer has been connected
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )

      expect(!!result).toBe(true)
    }) //check

    it("new ReservationPhysicalProduct has been created", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )

      expect(!!result.reservationPhysicalProduct).toBe(true)
    }) //check

    it("inventory status for new physicalProduct has been updated to reserved", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )

      expect(!!result.physicalProduct.status).toBe("Reserved")
    }) //check

    it("rentalInvoice resPhysProds array has been updated", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )
      const rentalInvoice = await prismaService.client.rentalInvoice.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: {
                contains: result.reservationPhysicalProduct.id,
                not: {
                  contains: bagItem.reservationPhysicalProduct.id,
                },
              },
            },
          },
        },
      })

      expect(!!rentalInvoice).toBe(true)
    })

    it("reservation's reservationPhysProds array has been updated", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const result = await bagService.swapBagItem(
        bagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          productVariant: {
            select: {
              reserved: true,
              reservable: true,
            },
          },
        }
      )

      const reservation = await prismaService.client.reservation.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: {
                contains: result.reservationPhysicalProduct.id,
                not: {
                  contains: bagItem.reservationPhysicalProduct.id,
                },
              },
            },
          },
        },
      })

      expect(!!reservation).toBe(true)
    }) //check
  })

  describe("Properly swaps item that has already been picked", () => {
    it("inventory status for old physicalProduct has been updated to nonreservable", async () => {
      const newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
        }
      )

      const oldBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItem.id,
        },
        select: {
          physicalProduct: {
            select: {
              id: true,
              inventoryStatus: true,
            },
          },
        },
      })

      await bagService.swapBagItem(bagItem.id, newPhysicalProduct.seasonsUID, {
        id: true,
        productVariant: {
          select: {
            reserved: true,
            reservable: true,
          },
        },
      })

      const oldPhysicalProduct = await prismaService.client.physicalProduct.findUnique(
        {
          where: {
            id: oldBagItem.physicalProduct.id,
          },
        }
      )

      expect(oldPhysicalProduct.inventoryStatus).toBe("NonReservable")
    })
  })
})