import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing" //compiles nestjs env

import { ProductModuleDef } from "../product.module"
import { BagService } from "../services/bag.service"

describe("Swap Bag Item", () => {
  let prismaService: PrismaService
  let bagService: BagService
  let testUtils: TestUtilsService
  let testCustomer: any
  let reservationTestUtils: ReservationTestUtilsService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    bagService = moduleRef.get<BagService>(BagService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
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
    warehouseLocation = await prismaService.client.warehouseLocation.findFirst({
      where: {
        type: "Rail",
      },
      select: {
        id: true,
      },
    })
  })

  let cleanupFuncs = []
  let reservationBeforeSwap
  let oldBagItemBeforeSwap
  let oldPhysicalProductBeforeSwap
  let newPhysicalProductBeforeSwap
  let newPhysicalProductAfterSwap
  let newBagItemAfterSwap
  let newReservationPhysicalProductAfterSwap
  let oldReservationPhysicalProductBeforeSwap
  let oldProductVariantBeforeSwap
  let newProductVariantBeforeSwap
  let newProductVariantAfterSwap
  let warehouseLocation

  describe("Properly swaps item that is not already in the bag", () => {
    //old bag item tests

    beforeAll(async () => {
      reservationBeforeSwap = await reservationTestUtils.addToBagAndReserveForCustomer(
        {
          customer: testCustomer,
          numProductsToAdd: 1,
          options: { shippingCode: "UPSGround" },
        }
      )

      oldBagItemBeforeSwap = reservationBeforeSwap.bagItems?.[0]
      oldPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: oldBagItemBeforeSwap.id,
              },
            },
          },
          select: {
            seasonsUID: true,
            productVariant: {
              select: {
                id: true,
                reserved: true,
                reservable: true,
              },
            },
          },
        }
      )
      oldProductVariantBeforeSwap = oldPhysicalProductBeforeSwap.productVariant
      await prismaService.client.physicalProduct.update({
        where: {
          seasonsUID: oldPhysicalProductBeforeSwap.seasonsUID,
        },
        data: {
          warehouseLocation: {
            connect: {
              id: warehouseLocation.id,
            },
          },
        },
      })

      oldReservationPhysicalProductBeforeSwap = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            bagItem: {
              id: oldBagItemBeforeSwap.id,
            },
          },
          select: {
            id: true,
          },
        }
      )

      newPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
          select: {
            seasonsUID: true,
            productVariant: {
              select: {
                id: true,
                reserved: true,
                reservable: true,
              },
            },
          },
        }
      )
      newProductVariantBeforeSwap = newPhysicalProductBeforeSwap.productVariant
      newBagItemAfterSwap = await bagService.swapBagItem(
        oldBagItemBeforeSwap.id,
        newPhysicalProductBeforeSwap.seasonsUID,
        {
          id: true,
          reservationPhysicalProduct: { select: { id: true, status: true } },
          productVariant: { select: { reservable: true, reserved: true } },
          physicalProduct: {
            select: { id: true, inventoryStatus: true, productStatus: true },
          },
        }
      )

      newPhysicalProductAfterSwap = newBagItemAfterSwap.physicalProduct
      newReservationPhysicalProductAfterSwap =
        newBagItemAfterSwap.reservationPhysicalProduct
      newProductVariantAfterSwap = newBagItemAfterSwap.productVariant
    })

    it("old bag item product variant counts have been updated", async () => {
      const oldProductVariantAfterSwap = await prismaService.client.productVariant.findUnique(
        {
          where: {
            id: oldProductVariantBeforeSwap.id,
          },
          select: {
            id: true,
            reservable: true,
            reserved: true,
          },
        }
      )

      expect(oldProductVariantBeforeSwap.reservable).toBe(
        oldProductVariantAfterSwap.reservable - 1
      )
    }) //check

    it("old bag item has been deleted", async () => {
      const oldBagItemAfterSwap = await prismaService.client.bagItem.findUnique(
        {
          where: {
            id: oldBagItemBeforeSwap.id,
          },
        }
      )

      expect(oldBagItemAfterSwap).toBe(null)
    }) //check

    it("old reservationPhysicalProduct has been deleted", async () => {
      const oldReservationPhysicalProductAfterSwap = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            id: oldReservationPhysicalProductBeforeSwap.id,
          },
        }
      )

      expect(oldReservationPhysicalProductAfterSwap).toBe(null)
    }) //check

    it("inventory status for old physicalProduct has been updated to reservable", async () => {
      const oldPhysicalProductAfterSwap = await prismaService.client.physicalProduct.findUnique(
        {
          where: {
            seasonsUID: oldPhysicalProductBeforeSwap.seasonsUID,
          },
          select: {
            seasonsUID: true,
            inventoryStatus: true,
          },
        }
      )

      expect(oldPhysicalProductAfterSwap.inventoryStatus).toBe("Reservable")
    }) //check

    it("new bag item product variant counts have been updated", async () => {
      expect(newProductVariantBeforeSwap.reserved + 1).toBe(
        newProductVariantAfterSwap.reserved
      )
    }) //check

    it("new ReservationPhysicalProduct has been created", async () => {
      expect(!!newReservationPhysicalProductAfterSwap).toBe(true)
    }) //check

    it("inventory status for new physicalProduct has been updated to reserved", async () => {
      expect(newPhysicalProductAfterSwap.inventoryStatus).toBe("Reserved")
    }) //check

    it("rentalInvoice resPhysProds array has been updated", async () => {
      const rentalInvoice = await prismaService.client.rentalInvoice.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: newReservationPhysicalProductAfterSwap.id,
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
      const updatedResPhysProdsArr = rentalInvoice.reservationPhysicalProducts.map(
        a => a.id
      )

      const rentalInvoiceHasBeenUpdated =
        updatedResPhysProdsArr.includes(
          newReservationPhysicalProductAfterSwap.id
        ) &&
        !updatedResPhysProdsArr.includes(
          oldReservationPhysicalProductBeforeSwap.id
        )

      expect(rentalInvoiceHasBeenUpdated).toBe(true)
    })

    it("reservation's reservationPhysProds array has been updated", async () => {
      const reservationAfterSwap = await prismaService.client.reservation.findFirst(
        {
          where: {
            reservationPhysicalProducts: {
              some: {
                id: newReservationPhysicalProductAfterSwap.id,
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
        }
      )
      const resPhysProdsAfterSwap = reservationAfterSwap.reservationPhysicalProducts.map(
        a => a.id
      )

      const reservationHasBeenUpdated =
        resPhysProdsAfterSwap.includes(
          newReservationPhysicalProductAfterSwap.id
        ) &&
        !resPhysProdsAfterSwap.includes(
          oldReservationPhysicalProductBeforeSwap.id
        )

      expect(reservationHasBeenUpdated).toBe(true)
    }) //check
  })

  describe("Properly swaps item that is already in the bag", () => {
    let addedBagItem
    beforeAll(async () => {
      reservationBeforeSwap = await reservationTestUtils.addToBagAndReserveForCustomer(
        {
          customer: testCustomer,
          numProductsToAdd: 1,
          options: { shippingCode: "UPSGround" },
        }
      )
      oldBagItemBeforeSwap = reservationBeforeSwap.bagItems?.[0]
      oldPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: oldBagItemBeforeSwap.id,
              },
            },
          },
          select: {
            seasonsUID: true,
            productVariant: {
              select: {
                id: true,
                reserved: true,
                reservable: true,
              },
            },
          },
        }
      )
      oldProductVariantBeforeSwap = oldPhysicalProductBeforeSwap.productVariant
      await prismaService.client.physicalProduct.update({
        where: {
          seasonsUID: oldPhysicalProductBeforeSwap.seasonsUID,
        },
        data: {
          warehouseLocation: {
            connect: {
              id: warehouseLocation.id,
            },
          },
        },
      })
      oldReservationPhysicalProductBeforeSwap = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            bagItem: {
              id: oldBagItemBeforeSwap.id,
            },
          },
          select: {
            id: true,
          },
        }
      )

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

      newPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            productVariant: {
              id: addedBagItem.productVariant.id,
            },
          },
          select: {
            seasonsUID: true,
            productVariant: {
              select: {
                reservable: true,
                reserved: true,
              },
            },
          },
        }
      )
      newProductVariantBeforeSwap = newPhysicalProductBeforeSwap.productVariant
      newBagItemAfterSwap = await bagService.swapBagItem(
        oldBagItemBeforeSwap.id,
        newPhysicalProductBeforeSwap.seasonsUID,
        {
          id: true,
          reservationPhysicalProduct: { select: { id: true, status: true } },
          productVariant: { select: { reservable: true, reserved: true } },
          physicalProduct: {
            select: { id: true, inventoryStatus: true, productStatus: true },
          },
        }
      )

      newPhysicalProductAfterSwap = newBagItemAfterSwap.physicalProduct
      newReservationPhysicalProductAfterSwap =
        newBagItemAfterSwap.reservationPhysicalProduct
      newProductVariantAfterSwap = newBagItemAfterSwap.productVariant
    })
    it("old bag item product variant counts have been updated", async () => {
      const oldProductVariantAfterSwap = await prismaService.client.productVariant.findUnique(
        {
          where: {
            id: oldProductVariantBeforeSwap.id,
          },
          select: {
            id: true,
            reservable: true,
            reserved: true,
          },
        }
      )

      expect(oldProductVariantBeforeSwap.reservable).toBe(
        oldProductVariantAfterSwap.reservable - 1
      )
    }) //check

    it("old bag item has been deleted", async () => {
      const oldBagItemAfterSwap = await prismaService.client.bagItem.findUnique(
        {
          where: {
            id: oldBagItemBeforeSwap.id,
          },
        }
      )

      expect(oldBagItemAfterSwap).toBe(null)
    }) //check

    it("old reservationPhysicalProduct has been deleted", async () => {
      const oldReservationPhysicalProductAfterSwap = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            id: oldReservationPhysicalProductBeforeSwap.id,
          },
        }
      )

      expect(oldReservationPhysicalProductAfterSwap).toBe(null)
    }) //check

    it("inventory status for old physicalProduct has been updated to reservable", async () => {
      const oldPhysicalProductAfterSwap = await prismaService.client.physicalProduct.findUnique(
        {
          where: {
            seasonsUID: oldPhysicalProductBeforeSwap.seasonsUID,
          },
          select: {
            seasonsUID: true,
            inventoryStatus: true,
          },
        }
      )

      expect(oldPhysicalProductAfterSwap.inventoryStatus).toBe("Reservable")
    }) //check

    it("new bag item product variant counts have been updated", async () => {
      newProductVariantAfterSwap
      newProductVariantBeforeSwap
      expect(newProductVariantBeforeSwap.reserved + 1).toBe(
        newProductVariantAfterSwap.reserved
      )
    }) //check

    it("new ReservationPhysicalProduct has been created", async () => {
      expect(!!newBagItemAfterSwap).toBe(true)
    }) //check

    it("inventory status for new physicalProduct has been updated to reserved", async () => {
      expect(newPhysicalProductAfterSwap.inventoryStatus).toBe("Reserved")
    }) //check

    it("rentalInvoice resPhysProds array has been updated", async () => {
      const rentalInvoice = await prismaService.client.rentalInvoice.findFirst({
        where: {
          reservationPhysicalProducts: {
            some: {
              id: newReservationPhysicalProductAfterSwap.id,
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
      const updatedResPhysProdsArr = rentalInvoice.reservationPhysicalProducts.map(
        a => a.id
      )

      const rentalInvoiceHasBeenUpdated =
        updatedResPhysProdsArr.includes(
          newReservationPhysicalProductAfterSwap.id
        ) &&
        !updatedResPhysProdsArr.includes(
          oldReservationPhysicalProductBeforeSwap.id
        )

      expect(rentalInvoiceHasBeenUpdated).toBe(true)
    })

    it("reservation's reservationPhysProds array has been updated", async () => {
      const reservationAfterSwap = await prismaService.client.reservation.findFirst(
        {
          where: {
            reservationPhysicalProducts: {
              some: {
                id: newReservationPhysicalProductAfterSwap.id,
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
        }
      )
      const resPhysProdsAfterSwap = reservationAfterSwap.reservationPhysicalProducts.map(
        a => a.id
      )

      const reservationHasBeenUpdated =
        resPhysProdsAfterSwap.includes(
          newReservationPhysicalProductAfterSwap.id
        ) &&
        !resPhysProdsAfterSwap.includes(
          oldReservationPhysicalProductBeforeSwap.id
        )

      expect(reservationHasBeenUpdated).toBe(true)
    }) //check
  })

  describe("Properly throws errors when the right conditions aren't met", () => {
    let swap
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
      reservationBeforeSwap = await reservationTestUtils.addToBagAndReserveForCustomer(
        {
          customer: testCustomer,
          numProductsToAdd: 2,
          options: { shippingCode: "UPSGround" },
        }
      )
      oldBagItemBeforeSwap = reservationBeforeSwap.bagItems?.[0]
      oldPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: oldBagItemBeforeSwap.id,
              },
            },
          },
        }
      )
      oldReservationPhysicalProductBeforeSwap = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            bagItem: {
              id: oldBagItemBeforeSwap.id,
            },
          },
          select: {
            id: true,
          },
        }
      )

      newPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            inventoryStatus: "Reservable",
          },
          select: {
            seasonsUID: true,
          },
        }
      )
      swap = async () => {
        await bagService.swapBagItem(
          oldBagItemBeforeSwap.id,
          newPhysicalProductBeforeSwap.seasonsUID,
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
      }
    })

    it("throws an error when the bagItem's resPhysProd doesn't have a status of Queued, Hold, or Picked", async () => {
      await prismaService.client.reservationPhysicalProduct.update({
        where: {
          id: oldReservationPhysicalProductBeforeSwap.id,
        },
        data: {
          status: "DeliveredToCustomer",
        },
      })

      await expect(swap()).rejects.toThrow(
        "Only bag items with status Picked, or Queued can be swapped"
      )
    })

    it("throws an error when bagItem doesn't have a status of Reserved", async () => {
      await prismaService.client.bagItem.update({
        where: {
          id: oldBagItemBeforeSwap.id,
        },
        data: {
          status: "Added",
        },
      })

      await expect(swap()).rejects.toThrow(
        new Error("Only Reserved bag items can be swapped")
      )
    })

    it("throws an error when new item is already in the bag and has been reserved", async () => {
      const bagItemAlreadyReserved = reservationBeforeSwap.bagItems[1]
      newPhysicalProductBeforeSwap = await prismaService.client.physicalProduct.findFirst(
        {
          where: {
            bagItems: {
              some: {
                id: {
                  in: [bagItemAlreadyReserved.id],
                },
              },
            },
          },
          select: {
            seasonsUID: true,
          },
        }
      )

      await expect(swap()).rejects.toThrowError(
        new Error("This item is in the customer's bag and has been reserved")
      )
    })
  })
})
