import {
  expectTimeToEqual,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "@app/modules/Payment/tests/utils/utils"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { ReservationTestUtilsService } from "@app/modules/Reservation/tests/reservation.test.utils"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import cuid from "cuid"

import { ProductModuleDef } from "../product.module"
import { BagService } from "../services/bag.service"

describe("Mark Items as Lost", () => {
  let prismaService: PrismaService
  let bagService: BagService
  let testUtils: TestUtilsService
  let reserveService: ReserveService
  let timeUtils: TimeUtilsService
  let reservationTestUtils: ReservationTestUtilsService

  let newReservation
  let cleanupFuncs = []
  let testCustomer
  let shipPackage

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(ProductModuleDef)
    const moduleRef = await moduleBuilder.compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    bagService = moduleRef.get<BagService>(BagService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    reservationTestUtils = moduleRef.get<ReservationTestUtilsService>(
      ReservationTestUtilsService
    )
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)

    const { cleanupFunc, customer } = await testUtils.createTestCustomer({})
    cleanupFuncs.push(cleanupFunc)
    testCustomer = customer

    shipPackage = async (shippedPackage, preLostResPhysProd, status) => {
      await prismaService.client.reservationPhysicalProduct.update({
        where: {
          id: preLostResPhysProd.id,
        },
        data:
          status === "ScannedOnOutbound"
            ? {
                status: "ScannedOnOutbound",
                hasBeenScannedOnOutbound: true,
                scannedOnOutboundAt: new Date(),
              }
            : {
                status: "ScannedOnInbound",
                hasBeenScannedOnInbound: true,
                scannedOnInboundAt: new Date(),
              },
      })

      await setPackageEnteredSystemAt(outboundPackage.id, 2, {
        prisma: prismaService,
        timeUtils,
      })
    }
  })

  let outboundPackage
  let inboundPackage
  let preLostBagItem
  let preLostBagItemId
  let preLostResPhysProd
  let preLostPhysicalProduct
  let preLostProductVariant
  let postLostResPhysProd
  let postLostPhysicalProd
  let postLostProductVariant

  describe("Outbound Package", () => {
    beforeAll(async () => {
      const {
        reservation,
        bagItems,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
        options: { shippingCode: "UPSGround" },
      })
      newReservation = reservation
      await setReservationCreatedAt(reservation.id, 4, {
        prisma: prismaService,
        timeUtils,
      })

      const transactionID = cuid()
      outboundPackage = await prismaService.client.package.create({
        data: {
          reservationOnSentPackage: {
            connect: {
              id: reservation.id,
            },
          },
          transactionID,
        },
      })

      preLostBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItems[0].id,
        },
        select: {
          id: true,
          reservationPhysicalProduct: {
            select: {
              id: true,
              hasBeenLost: true,
              lostInPhase: true,
              lostAt: true,
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
              reserved: true,
              reservable: true,
              nonReservable: true,
            },
          },
        },
      })

      preLostBagItemId = preLostBagItem.id
      preLostResPhysProd = preLostBagItem.reservationPhysicalProduct
      preLostPhysicalProduct = preLostBagItem.physicalProduct
      preLostProductVariant = preLostBagItem.productVariant

      await shipPackage(
        outboundPackage,
        preLostResPhysProd,
        "ScannedOnOutbound"
      )

      await bagService.markAsLost(preLostBagItemId)

      postLostResPhysProd = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            id: {
              in: preLostResPhysProd.id,
            },
          },
          select: {
            id: true,
            status: true,
            lostAt: true,
            hasBeenLost: true,
            lostInPhase: true,
            physicalProduct: {
              select: {
                id: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reservable: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
          },
        }
      )

      postLostPhysicalProd = postLostResPhysProd.physicalProduct
      postLostProductVariant = postLostPhysicalProd.productVariant
    })

    it("removes bag item from customer's bag", async () => {
      const postLostBagItems = await prismaService.client.bagItem.findUnique({
        where: {
          id: preLostBagItemId,
        },
      })

      expect(postLostBagItems).toBeNull
    })

    it("sets lostAt on reservationPhysicalProducts", () => {
      expectTimeToEqual(postLostResPhysProd.returnProcessAt, new Date())
    })
    it("sets hasBeenLost on reservationPhysicalProducts", () => {
      expect(postLostResPhysProd.hasBeenLost).toBe(true)
    })
    it("sets lostInPhase on reservationPhysicalProducts", () => {
      expect(postLostResPhysProd.lostInPhase).toBe("BusinessToCustomer")
    })

    it("updates productVariant counts", () => {
      expect(postLostProductVariant.nonReservable).toBe(
        preLostProductVariant.nonReservable + 1
      )
      expect(postLostProductVariant.reserved).toBe(
        preLostProductVariant.reserved - 1
      )
    })

    it("sets physicalProduct inventoryStatus to NonReservable", () => {
      expect(postLostPhysicalProd.inventoryStatus).toBe("NonReservable")
    })

    it("sets physicalProduct productStatus to Lost", () => {
      expect(postLostPhysicalProd.productStatus).toBe("Lost")
    })

    it("updates reservation status to lost", async () => {
      const updatedReservation = await prismaService.client.reservation.findUnique(
        {
          where: {
            id: newReservation.id,
          },
          select: {
            status: true,
          },
        }
      )
      expect(updatedReservation.status).toBe("Lost")
    })
  })

  describe("Inbound Package", () => {
    beforeAll(async () => {
      const {
        reservation,
        bagItems,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
        options: { shippingCode: "UPSGround" },
      })

      await setReservationCreatedAt(reservation.id, 10, {
        prisma: prismaService,
        timeUtils,
      })

      const transactionID = cuid()
      inboundPackage = await prismaService.client.package.create({
        data: {
          reservationOnSentPackage: {
            connect: {
              id: reservation.id,
            },
          },
          transactionID,
        },
      })

      preLostBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItems[0].id,
        },
        select: {
          id: true,
          reservationPhysicalProduct: {
            select: {
              id: true,
              hasBeenLost: true,
              lostInPhase: true,
              lostAt: true,
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
              reserved: true,
              reservable: true,
              nonReservable: true,
            },
          },
        },
      })

      preLostBagItemId = preLostBagItem.id
      preLostResPhysProd = preLostBagItem.reservationPhysicalProduct
      preLostPhysicalProduct = preLostBagItem.physicalProduct
      preLostProductVariant = preLostBagItem.productVariant

      await shipPackage(outboundPackage, preLostResPhysProd, "ScannedOnInbound")

      await bagService.markAsLost(preLostBagItemId)

      postLostResPhysProd = await prismaService.client.reservationPhysicalProduct.findFirst(
        {
          where: {
            id: preLostResPhysProd.id,
          },
          select: {
            id: true,
            status: true,
            lostAt: true,
            hasBeenLost: true,
            lostInPhase: true,
            physicalProduct: {
              select: {
                id: true,
                inventoryStatus: true,
                productStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reservable: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
          },
        }
      )

      postLostPhysicalProd = postLostResPhysProd.physicalProduct
      postLostProductVariant = postLostPhysicalProd.productVariant
    })

    it("removes bag item from customer's bag", async () => {
      const postLostBagItems = await prismaService.client.bagItem.findUnique({
        where: {
          id: preLostBagItemId,
        },
      })

      expect(postLostBagItems).toBeNull
    })

    it("sets lostAt on reservationPhysicalProducts", () => {
      expectTimeToEqual(postLostResPhysProd.returnProcessAt, new Date())
    })
    it("sets hasBeenLost on reservationPhysicalProducts", () => {
      expect(postLostResPhysProd.hasBeenLost).toBe(true)
    })
    it("sets lostInPhase on reservationPhysicalProducts", () => {
      expect(postLostResPhysProd.lostInPhase).toBe("CustomerToBusiness")
    })

    it("updates productVariant counts", () => {
      expect(postLostProductVariant.nonReservable).toBe(
        preLostProductVariant.nonReservable + 1
      )
      expect(postLostProductVariant.reserved).toBe(
        preLostProductVariant.reserved - 1
      )
    })

    it("sets physicalProduct inventoryStatus to NonReservable", () => {
      expect(postLostPhysicalProd.inventoryStatus).toBe("NonReservable")
    })

    it("sets physicalProduct productStatus to Lost", () => {
      expect(postLostPhysicalProd.productStatus).toBe("Lost")
    })

    it("updates reservation status to lost", async () => {
      const updatedReservation = await prismaService.client.reservation.findUnique(
        {
          where: {
            id: newReservation.id,
          },
          select: {
            status: true,
          },
        }
      )
      expect(updatedReservation.status).toBe("Lost")
    })
  })

  describe("Properly throws errors when the right conditions aren't met", () => {
    beforeEach(async () => {
      const {
        reservation,
        bagItems,
      } = await reservationTestUtils.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 3,
        options: { shippingCode: "UPSGround" },
      })

      await setReservationCreatedAt(reservation.id, 10, {
        prisma: prismaService,
        timeUtils,
      })

      const transactionID = cuid()
      outboundPackage = await prismaService.client.package.create({
        data: {
          reservationOnSentPackage: {
            connect: {
              id: reservation.id,
            },
          },
          transactionID,
        },
      })

      preLostBagItem = await prismaService.client.bagItem.findUnique({
        where: {
          id: bagItems[0].id,
        },
        select: {
          id: true,
          reservationPhysicalProduct: {
            select: {
              id: true,
              hasBeenLost: true,
              lostInPhase: true,
              lostAt: true,
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
              reserved: true,
              reservable: true,
              nonReservable: true,
            },
          },
        },
      })
      preLostBagItemId = preLostBagItem.id
    })
    it("throws an error when the items don't have the correct status", async () => {
      const processLostItems = async () => {
        await bagService.markAsLost(preLostBagItemId)
      }
      await expect(processLostItems()).rejects.toThrowError(
        "Lost phase is undefined, status does not match an inbound or outbound phase"
      )
    })
  })
})
