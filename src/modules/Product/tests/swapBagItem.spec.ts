import { ReservationService } from "@app/modules/Reservation"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
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
  let testCustomer: any
  let reservationTestUtils: ReservationTestUtilsService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    reservationService = moduleRef.get<ReservationService>(ReservationService)
    utilsService = moduleRef.get<UtilsService>(UtilsService)
    bagService = moduleRef.get<BagService>(BagService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
  })
  let cleanupFuncs = []
  let reservation
  let oldBagItem
  let oldPhysicalProduct
  let newPhysicalProduct
  let newBagItem
  let newReservationPhysicalProduct
  let oldReservationPhysicalProduct
  let oldProductVariant
  let newProductVariant
  let result

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
    result = await reservationTestUtils.addToBagAndReserveForCustomer({
      customer: testCustomer,
      numProductsToAdd: 1,
      options: { shippingCode: "UPSGround" },
    })
    reservation = result.reservation
    oldBagItem = result.bagItems?.[0]
    oldPhysicalProduct = await prismaService.client.physicalProduct.findFirst({
      where: {
        bagItems: {
          some: {
            id: oldBagItem.id,
          },
        },
      },
    })
    oldReservationPhysicalProduct = await prismaService.client.reservationPhysicalProduct.findFirst(
      {
        where: {
          bagItem: {
            id: oldBagItem.id,
          },
        },
        select: {
          id: true,
        },
      }
    )

    newPhysicalProduct = await prismaService.client.physicalProduct.findFirst({
      where: {
        inventoryStatus: "Reservable",
      },
      select: {
        seasonsUID: true,
      },
    })
  })

  describe("Properly swaps item that is not already in the bag", () => {
    //old bag item tests

    beforeEach(async () => {
      newBagItem = await bagService.swapBagItem(
        oldBagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          reservationPhysicalProduct: { select: { id: true, status: true } },
          productVariant: { select: { reservable: true, nonReservable: true } },
          physicalProduct: {
            select: { id: true, inventoryStatus: true, productStatus: true },
          },
        }
      )

      // newPhysicalProduct = newBagItem.physicalProduct
      newReservationPhysicalProduct = newBagItem.reservationPhysicalProduct
      newProductVariant = newBagItem.productVariant
    })

    it("old bag item product variant counts have been updated", async () => {
      oldProductVariant = await prismaService.client.productVariant.findUnique({
        where: {
          id: oldBagItem.productVariantId,
        },
      })

      expect(oldProductVariant.reservable).toBe(oldProductVariant.reserved + 1)
    }) //check

    it("old bag item has been deleted", async () => {
      const bagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: oldBagItem.id,
        },
      })

      expect(bagItem).toBe(null)
    }) //check

    it("old reservationPhysicalProduct has been deleted", async () => {
      const oldReservationPhysicalProduct = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            bagItem: {
              id: oldBagItem.id,
            },
          },
        }
      )

      expect(oldReservationPhysicalProduct).toBe(null)
    }) //check

    it("inventory status for old physicalProduct has been updated to reservable", async () => {
      const physicalProduct = await prismaService.client.physicalProduct.findUnique(
        {
          where: {
            seasonsUID: oldPhysicalProduct.seasonsUID,
          },
          select: {
            seasonsUID: true,
            inventoryStatus: true,
          },
        }
      )

      expect(physicalProduct.inventoryStatus).toBe("Reservable")
    }) //check

    it("new bag item product variant counts have been updated", async () => {
      const newProductVariant = await prismaService.client.productVariant.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: newBagItem.id,
              },
            },
          },
          select: {
            reservable: true,
            reserved: true,
          },
        }
      )

      expect(newProductVariant.reservable).toBe(newProductVariant.reserved - 1)
    }) //check

    it("new ReservationPhysicalProduct has been created", async () => {
      expect(!!newBagItem.reservationPhysicalProduct).toBe(true)
    }) //check

    it("inventory status for new physicalProduct has been updated to reserved", async () => {
      expect(newBagItem.physicalProduct.inventoryStatus).toBe("Reserved")
    }) //check

    it("rentalInvoice resPhysProds array has been updated", async () => {
      const rentalInvoice = await prismaService.client.rentalInvoice.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: newReservationPhysicalProduct.id,
            },
          },
        },
        select: {
          reservationPhysicalProducts: {
            select: {
              id: true,
            },
          },
        },
      })

      const rentalInvoiceIsUpdated = rentalInvoice.reservationPhysicalProducts.every(
        a => a.id !== oldReservationPhysicalProduct.id
      )

      expect(rentalInvoiceIsUpdated).toBe(true)
    })

    it("reservation's reservationPhysProds array has been updated", async () => {
      const reservation = await prismaService.client.reservation.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: newReservationPhysicalProduct.id,
            },
          },
        },
        select: {
          reservationPhysicalProducts: {
            select: {
              id: true,
            },
          },
        },
      })

      const reservationHasBeenUpdated = reservation.reservationPhysicalProducts.every(
        a => a.id !== oldReservationPhysicalProduct.id
      )

      expect(reservationHasBeenUpdated).toBe(true)
    }) //check
  })

  describe("Properly swaps item that is already in the bag", () => {
    let addedBagItem
    beforeEach(async () => {
      const reservedBagItems = await prismaService.client.bagItem.findMany({
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
      const nextProdVar = await prismaService.client.productVariant.findFirst({
        where: {
          reservable: { gte: 1 },
          sku: { notIn: reservedSKUs },
          // Ensure we reserve diff products each time. Needed for some tests
          product: {
            id: { notIn: [...reservedProductIds] },
          },
          // We shouldn't need to check this since we're checking counts,
          // but there's some corrupt data so we do this to circumvent that.
          physicalProducts: { some: { inventoryStatus: "Reservable" } },
        },
        take: 1,
        select: {
          id: true,
          productId: true,
        },
      })

      addedBagItem = await bagService.addToBag(nextProdVar.id, testCustomer, {
        productVariant: {
          select: {
            id: true,
          },
        },
      })

      newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            productVariant: {
              id: addedBagItem.productVariant.id,
            },
          },
          select: {
            seasonsUID: true,
          },
        }
      )

      newBagItem = await bagService.swapBagItem(
        oldBagItem.id,
        newPhysicalProduct.seasonsUID,
        {
          id: true,
          reservationPhysicalProduct: { select: { id: true, status: true } },
          productVariant: { select: { reservable: true, nonReservable: true } },
          physicalProduct: {
            select: { id: true, inventoryStatus: true, productStatus: true },
          },
        }
      )

      // newPhysicalProduct = newBagItem.physicalProduct
      newReservationPhysicalProduct = newBagItem.reservationPhysicalProduct
      newProductVariant = newBagItem.productVariant
    })
    it("old bag item product variant counts have been updated", async () => {
      oldProductVariant = await prismaService.client.productVariant.findUnique({
        where: {
          id: oldBagItem.productVariantId,
        },
      })

      expect(oldProductVariant.reservable).toBe(oldProductVariant.reserved + 1)
    }) //check

    it("old bag item has been deleted", async () => {
      const bagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: oldBagItem.id,
        },
      })

      expect(bagItem).toBe(null)
    }) //check

    it("old reservationPhysicalProduct has been deleted", async () => {
      const oldReservationPhysicalProduct = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            bagItem: {
              id: oldBagItem.id,
            },
          },
        }
      )

      expect(oldReservationPhysicalProduct).toBe(null)
    }) //check

    it("inventory status for old physicalProduct has been updated to reservable", async () => {
      const physicalProduct = await prismaService.client.physicalProduct.findUnique(
        {
          where: {
            seasonsUID: oldPhysicalProduct.seasonsUID,
          },
          select: {
            seasonsUID: true,
            inventoryStatus: true,
          },
        }
      )
      console.log(physicalProduct)
      expect(physicalProduct.inventoryStatus).toBe("Reservable")
    }) //check

    it("new bag item product variant counts have been updated", async () => {
      const newProductVariant = await prismaService.client.productVariant.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: newBagItem.id,
              },
            },
          },
          select: {
            reservable: true,
            reserved: true,
          },
        }
      )

      expect(newProductVariant.reservable).toBe(newProductVariant.reserved - 1)
    }) //check

    it("new ReservationPhysicalProduct has been created", async () => {
      expect(!!newBagItem.reservationPhysicalProduct).toBe(true)
    }) //check

    it("inventory status for new physicalProduct has been updated to reserved", async () => {
      expect(newBagItem.physicalProduct.inventoryStatus).toBe("Reserved")
    }) //check

    it("rentalInvoice resPhysProds array has been updated", async () => {
      const rentalInvoice = await prismaService.client.rentalInvoice.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: newReservationPhysicalProduct.id,
            },
          },
        },
        select: {
          reservationPhysicalProducts: {
            select: {
              id: true,
            },
          },
        },
      })

      const rentalInvoiceIsUpdated = rentalInvoice.reservationPhysicalProducts.every(
        a => a.id !== oldReservationPhysicalProduct.id
      )

      expect(rentalInvoiceIsUpdated).toBe(true)
    })

    it("reservation's reservationPhysProds array has been updated", async () => {
      const reservation = await prismaService.client.reservation.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: newReservationPhysicalProduct.id,
            },
          },
        },
        select: {
          reservationPhysicalProducts: {
            select: {
              id: true,
            },
          },
        },
      })

      const reservationHasBeenUpdated = reservation.reservationPhysicalProducts.every(
        a => a.id !== oldReservationPhysicalProduct.id
      )

      expect(reservationHasBeenUpdated).toBe(true)
    }) //check
  })

  describe("Properly throws errors when the right conditions aren't met", () => {
    it("throws an error when the bagItem's resPhysProd doesn't have a status of Queued, Hold, or Picked", async () => {
      await prismaService.client.reservationPhysicalProduct.update({
        where: {
          id: oldReservationPhysicalProduct.id,
        },
        data: {
          status: "DeliveredToCustomer",
        },
      })

      expect(
        await bagService.swapBagItem(
          oldBagItem.id,
          newPhysicalProduct.seasonsUID,
          {
            id: true,
            reservationPhysicalProduct: { select: { id: true, status: true } },
            productVariant: {
              select: { reservable: true, nonReservable: true },
            },
            physicalProduct: {
              select: { id: true, inventoryStatus: true, productStatus: true },
            },
          }
        )
      ).toThrow(
        "Only bag items with status Hold, Picked, or Queued can be swapped"
      )
    })
    it("throws an error when bagItem doesn't have a status of Reserved", async () => {
      await prismaService.client.bagItem.update({
        where: {
          id: oldBagItem.id,
        },
        data: {
          status: "Added",
        },
      })

      expect(
        await bagService.swapBagItem(
          oldBagItem.id,
          newPhysicalProduct.seasonsUID,
          {
            id: true,
            reservationPhysicalProduct: { select: { id: true, status: true } },
            productVariant: {
              select: { reservable: true, nonReservable: true },
            },
            physicalProduct: {
              select: { id: true, inventoryStatus: true, productStatus: true },
            },
          }
        )
      ).toThrow("Only Reserved bag items can be swapped")
    })

    it("throws an error when new item is already in the bag and has been reserved", async () => {
      result = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 1,
        options: { shippingCode: "UPSGround" },
      })
      newPhysicalProduct = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: result.bagItems[0].id,
              },
            },
          },
          select: {
            seasonsUID: true,
          },
        }
      )

      expect(
        await bagService.swapBagItem(
          oldBagItem.id,
          newPhysicalProduct.seasonsUID,
          {
            id: true,
            reservationPhysicalProduct: { select: { id: true, status: true } },
            productVariant: {
              select: { reservable: true, nonReservable: true },
            },
            physicalProduct: {
              select: { id: true, inventoryStatus: true, productStatus: true },
            },
          }
        )
      ).toThrow("This item is in the customer's bag and has been reserved")
    })
  })
})
