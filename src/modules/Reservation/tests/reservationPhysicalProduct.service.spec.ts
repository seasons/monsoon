import { BagService } from "@app/modules/Product/services/bag.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Customer } from "@prisma/client"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationPhysicalProductService } from "../services/reservationPhysicalProduct.service"
import { ReservationTestUtilsService } from "./reservation.test.utils"

describe("Reservation Physical Product Service", () => {
  let reservationPhysicalProductService: ReservationPhysicalProductService
  let bagService: BagService
  let reservationUtilsTestService: ReservationTestUtilsService
  let testService: TestUtilsService
  let prisma: PrismaService
  let testCustomer: Customer

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(
      ReservationModuleRef
    ).compile()

    reservationPhysicalProductService = moduleRef.get<
      ReservationPhysicalProductService
    >(ReservationPhysicalProductService)
    reservationUtilsTestService = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
    testService = moduleRef.get<TestUtilsService>(TestUtilsService)
    prisma = moduleRef.get<PrismaService>(PrismaService)
    bagService = moduleRef.get<BagService>(BagService)

    const { customer } = await testService.createTestCustomer()

    testCustomer = customer
  })

  describe("Mark as found", () => {
    it("sets the bag item back to the correct status", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 1,
        options: {
          bagItemSelect: {
            id: true,
            status: true,

            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
                physicalProduct: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      })

      const bagItem = bagItems[0]
      const rppId = bagItem.reservationPhysicalProduct.id

      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: rppId,
        },
        data: {
          status: "InTransitInbound",
        },
      })

      await bagService.markAsLost({ lostBagItemId: bagItem.id })

      const lostRpp = await prisma.client.reservationPhysicalProduct.findUnique(
        {
          where: {
            id: rppId,
          },
          select: {
            status: true,
            bagItem: {
              select: {
                id: true,
              },
            },
          },
        }
      )

      expect(lostRpp.status).toBe("Lost")
      expect(lostRpp.bagItem).toBeNull()

      await reservationPhysicalProductService.markAsFound({
        rppId,
        status: "DeliveredToCustomer",
      })

      const foundRpp = await prisma.client.reservationPhysicalProduct.findUnique(
        {
          where: {
            id: rppId,
          },
          select: {
            status: true,
            bagItem: {
              select: {
                id: true,
                physicalProduct: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        }
      )

      expect(foundRpp.status).toBe("DeliveredToCustomer")
      expect(foundRpp.bagItem.id).toBeDefined()
      expect(foundRpp.bagItem.physicalProduct.id).toBe(
        bagItem.reservationPhysicalProduct.physicalProduct.id
      )
    })
  })

  describe("Mark as not returned", () => {
    it("Correctly updates the status and revelant fields", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 1,
        options: {
          bagItemSelect: {
            id: true,
            status: true,

            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      })

      const rppId = bagItems[0].reservationPhysicalProduct.id
      const now = new Date().toISOString()

      const inboundPackage = await prisma.client.package.create({
        data: {
          transactionID: "test",
        },
      })

      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: rppId,
        },
        data: {
          status: "DeliveredToBusiness",
          hasBeenScannedOnInbound: true,
          scannedOnInboundAt: now,
          hasBeenDeliveredToBusiness: true,
          deliveredToBusinessAt: now,
          inboundPackage: { connect: { id: inboundPackage.id } },
          physicalProduct: {
            update: { packages: { connect: { id: inboundPackage.id } } },
          },
        },
      })

      await reservationPhysicalProductService.markNotReturned({ rppId })

      const markedNotReturnedRpp = await prisma.client.reservationPhysicalProduct.findUnique(
        {
          where: {
            id: rppId,
          },
          select: {
            status: true,
            hasBeenScannedOnInbound: true,
            scannedOnInboundAt: true,
            hasBeenDeliveredToBusiness: true,
            deliveredToBusinessAt: true,
            inboundPackage: { select: { id: true } },
            physicalProduct: {
              select: { packages: { select: { id: true } } },
            },
          },
        }
      )

      expect(markedNotReturnedRpp.status).toBe("AtHome")
      expect(markedNotReturnedRpp.hasBeenScannedOnInbound).toBe(false)
      expect(markedNotReturnedRpp.scannedOnInboundAt).toBeNull()
      expect(markedNotReturnedRpp.hasBeenDeliveredToBusiness).toBe(false)
      expect(markedNotReturnedRpp.deliveredToBusinessAt).toBeNull()
      expect(markedNotReturnedRpp.inboundPackage).toBeNull()
      expect(markedNotReturnedRpp.physicalProduct.packages.length).toBe(0)
    })
  })

  describe("Pick Items", () => {
    it("Changes items from status Queued to Picked", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 2,
        options: {
          bagItemSelect: {
            id: true,
            status: true,

            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      })

      for (let bagItem of bagItems) {
        expect(bagItem.reservationPhysicalProduct.status).toBe("Queued")
      }

      const bagItemIds = bagItems.map(bagItem => bagItem.id)
      const result = await reservationPhysicalProductService.pickItems({
        bagItemIds,
        select: {
          id: true,
          status: true,
        },
      })

      for (let reservationPhysicalProduct of result) {
        expect(reservationPhysicalProduct.status).toBe("Picked")
      }
    })

    it("Throws an error if one of the items is not set to Queued status", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 2,
        options: {
          bagItemSelect: {
            id: true,
            status: true,
            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
                isOnHold: true,
              },
            },
          },
        },
      })

      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: bagItems[0].reservationPhysicalProduct.id,
        },
        data: {
          status: "Picked",
        },
      })

      expect(async () => {
        await reservationPhysicalProductService.pickItems({
          bagItemIds: bagItems.map(b => b.id),
        })
      }).rejects.toThrowError(
        "All reservation physical product statuses should be set to Queued"
      )
    })

    it("Throws an error if one item is on hold", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 1,
        options: {
          bagItemSelect: {
            id: true,
            status: true,
            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
                isOnHold: true,
              },
            },
          },
        },
      })

      const firstBagItem = bagItems?.[0]
      const rpp = firstBagItem.reservationPhysicalProduct
      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: rpp.id,
        },
        data: {
          isOnHold: true,
        },
      })

      expect(async () => {
        await reservationPhysicalProductService.pickItems({
          bagItemIds: bagItems.map(b => b.id),
        })
      }).rejects.toThrowError(
        `The following bagItems are on hold: ${firstBagItem.id}`
      )
    })
  })

  describe("Pack Items", () => {
    it("Changes items from status Picked to Packed", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 2,
        options: {
          bagItemSelect: {
            id: true,
            status: true,

            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      })

      await prisma.client.reservationPhysicalProduct.updateMany({
        where: {
          id: { in: bagItems.map(b => b.reservationPhysicalProduct.id) },
        },
        data: {
          status: "Picked",
        },
      })

      const result = await reservationPhysicalProductService.packItems({
        bagItemIds: bagItems.map(b => b.id),
        select: {
          id: true,
          status: true,
        },
      })

      for (let reservationPhysicalProduct of result) {
        expect(reservationPhysicalProduct.status).toBe("Packed")
      }
    })

    it("Throws an error if one of the items is not set to Picked status", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 2,
        options: {
          bagItemSelect: {
            id: true,
            status: true,
            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
                isOnHold: true,
              },
            },
          },
        },
      })

      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: bagItems[0].reservationPhysicalProduct.id,
        },
        data: {
          status: "Packed",
        },
      })

      expect(async () => {
        await reservationPhysicalProductService.packItems({
          bagItemIds: bagItems.map(b => b.id),
        })
      }).rejects.toThrowError(
        "All reservation physical product statuses should be set to Picked"
      )
    })

    it("Throws an error if one item is on hold", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 1,
        options: {
          bagItemSelect: {
            id: true,
            status: true,
            reservationPhysicalProduct: {
              select: {
                id: true,
                status: true,
                isOnHold: true,
              },
            },
          },
        },
      })

      const firstBagItem = bagItems?.[0]
      const rpp = firstBagItem.reservationPhysicalProduct
      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: rpp.id,
        },
        data: {
          isOnHold: true,
        },
      })

      await prisma.client.reservationPhysicalProduct.update({
        where: {
          id: bagItems[0].reservationPhysicalProduct.id,
        },
        data: {
          status: "Picked",
        },
      })

      expect(async () => {
        await reservationPhysicalProductService.packItems({
          bagItemIds: bagItems.map(b => b.id),
        })
      }).rejects.toThrowError(
        `The following bagItems are on hold: ${firstBagItem.id}`
      )
    })
  })

  describe("Shipping labels", () => {
    const bagItemsSelect = {
      id: true,
      reservationPhysicalProduct: {
        select: {
          id: true,
          outboundPackage: true,
          inboundPackage: true,
          physicalProduct: {
            select: {
              packages: {
                select: {
                  id: true,
                },
              },
            },
          },
          reservation: {
            select: {
              id: true,
              sentPackage: {
                select: {
                  id: true,
                },
              },
              returnedPackage: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    }

    const getShippingLabelsForShippingCode = async shippingCode => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 2,
        options: {
          shippingCode,
        },
      })

      const bagItemIds = bagItems.map(b => b.id)

      await reservationPhysicalProductService.pickItems({
        bagItemIds,
        select: {
          id: true,
          status: true,
        },
      })

      await reservationPhysicalProductService.packItems({
        bagItemIds,
        select: {
          id: true,
          status: true,
        },
      })

      return [
        bagItems,
        await reservationPhysicalProductService.generateShippingLabels({
          bagItemIds,
          select: {
            id: true,
            status: true,
            shippingMethod: true,
          },
        }),
      ]
    }

    it("Creates shipping labels correctly", async () => {
      const [bagItems, packages] = await getShippingLabelsForShippingCode(
        "UPSGround"
      )
      const [outboundPackage, inboundPackage] = packages

      const updatedBagItems = await prisma.client.bagItem.findMany({
        where: {
          id: {
            in: bagItems.map(bagItem => bagItem.id),
          },
        },
        select: bagItemsSelect,
      })

      for (let bagItem of updatedBagItems) {
        const rpp = bagItem.reservationPhysicalProduct

        expect(rpp.outboundPackage.id).toEqual(outboundPackage.id)
        expect(rpp.inboundPackage.id).toEqual(inboundPackage.id)
        expect(rpp.reservation.sentPackage.id).toEqual(outboundPackage.id)
        expect(rpp.reservation.returnedPackage.id).toEqual(inboundPackage.id)
        expect(rpp.physicalProduct.packages.length).toBeGreaterThanOrEqual(1)
      }

      expect(outboundPackage.shippingMethod.code).toEqual("UPSGround")
      expect(inboundPackage.shippingMethod.code).toEqual("UPSGround")
    })

    it("Sets shipping method to UPS Select on packages if selected in reservation", async () => {
      const [bagItems, packages] = await getShippingLabelsForShippingCode(
        "UPSSelect"
      )
      const [outboundPackage, inboundPackage] = packages

      const updatedBagItems = await prisma.client.bagItem.findMany({
        where: {
          id: {
            in: bagItems.map(bagItem => bagItem.id),
          },
        },
        select: bagItemsSelect,
      })

      for (let bagItem of updatedBagItems) {
        const rpp = bagItem.reservationPhysicalProduct

        expect(rpp.outboundPackage.id).toEqual(outboundPackage.id)
        expect(rpp.inboundPackage.id).toEqual(inboundPackage.id)
        expect(rpp.reservation.sentPackage.id).toEqual(outboundPackage.id)
        expect(rpp.reservation.returnedPackage.id).toEqual(inboundPackage.id)
        expect(rpp.physicalProduct.packages.length).toBeGreaterThanOrEqual(2)
      }

      expect(outboundPackage.shippingMethod.code).toEqual("UPSSelect")
      expect(inboundPackage.shippingMethod.code).toEqual("UPSSelect")
    })

    it("Creates only an outbound label if the shipping method is Pickup", async () => {
      const [bagItems, packages] = await getShippingLabelsForShippingCode(
        "Pickup"
      )
      const [outboundPackage, inboundPackage] = packages

      const updatedBagItems = await prisma.client.bagItem.findMany({
        where: {
          id: {
            in: bagItems.map(bagItem => bagItem.id),
          },
        },
        select: bagItemsSelect,
      })

      for (let bagItem of updatedBagItems) {
        const rpp = bagItem.reservationPhysicalProduct

        expect(rpp.inboundPackage.id).toEqual(inboundPackage.id)
        expect(rpp.reservation.returnedPackage.id).toEqual(inboundPackage.id)
        expect(rpp.physicalProduct.packages.length).toBeGreaterThanOrEqual(2)
      }

      expect(outboundPackage).toBeNull()
      expect(inboundPackage.shippingMethod.code).toEqual("Pickup")
    })
  })
})
