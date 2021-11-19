import {
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

    shipPackage = async (outboundPackage, preLostResPhysProds, status) => {
      await prismaService.client.reservationPhysicalProduct.updateMany({
        where: {
          id: {
            in: preLostResPhysProds.map(a => a.id),
          },
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
  let preLostBagItems
  let preLostBagItemIds
  let preLostResPhysProds
  let preLostPhysicalProduct
  let preLostProductVariants
  let postLostResPhysProds
  let postLostPhysicalProds
  let postLostProductVariants

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

      preLostBagItems = await prismaService.client.bagItem.findMany({
        where: {
          id: {
            in: bagItems.map(a => a.id),
          },
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

      preLostBagItemIds = preLostBagItems.map(a => a.id)
      preLostResPhysProds = preLostBagItems.map(
        a => a.reservationPhysicalProduct
      )
      preLostPhysicalProduct = preLostBagItems.map(a => a.physicalProduct)
      preLostProductVariants = preLostBagItems.map(a => a.productVariant)

      await shipPackage(
        outboundPackage,
        preLostResPhysProds,
        "ScannedOnOutbound"
      )

      await bagService.processLostItems(preLostBagItemIds)

      postLostResPhysProds = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            id: {
              in: preLostResPhysProds.map(a => a.id),
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

      postLostPhysicalProds = postLostResPhysProds.map(a => a.physicalProduct)
      postLostProductVariants = postLostPhysicalProds.map(a => a.productVariant)
    })

    it("removes bag items from customer's bag", async () => {
      const postLostBagItems = await prismaService.client.bagItem.findMany({
        where: {
          id: {
            in: preLostBagItemIds,
          },
        },
      })

      expect(postLostBagItems.length).toBe(0)
    })

    it("sets lostAt on reservationPhysicalProducts", () => {
      postLostResPhysProds.forEach(a => expect(!!a.lostAt).toBe(true))
    })
    it("sets hasBeenLost on reservationPhysicalProducts", () => {
      postLostResPhysProds.forEach(a => expect(a.hasBeenLost).toBe(true))
    })
    it("sets lostInPhase on reservationPhysicalProducts", () => {
      postLostResPhysProds.forEach(a =>
        expect(a.lostInPhase).toBe("BusinessToCustomer")
      )
    })

    it("updates productVariant counts", () => {
      postLostProductVariants.forEach((productVariant, index) => {
        const preLostProdVariant = preLostProductVariants[index]
        expect(preLostProdVariant.nonReservable + 1).toBe(
          productVariant.nonReservable
        )
        expect(preLostProdVariant.reserved - 1).toBe(productVariant.reserved)
      })
    })

    it("sets physicalProduct inventoryStatus to NonReservable", () => {
      postLostPhysicalProds.every(a =>
        expect(a.inventoryStatus).toBe("NonReservable")
      )
    })

    it("sets physicalProduct productStatus to Lost", () => {
      postLostPhysicalProds.every(a => expect(a.productStatus).toBe("Lost"))
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

      preLostBagItems = await prismaService.client.bagItem.findMany({
        where: {
          id: {
            in: bagItems.map(a => a.id),
          },
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

      preLostBagItemIds = preLostBagItems.map(a => a.id)
      preLostResPhysProds = preLostBagItems.map(
        a => a.reservationPhysicalProduct
      )
      preLostPhysicalProduct = preLostBagItems.map(a => a.physicalProduct)
      preLostProductVariants = preLostBagItems.map(a => a.productVariant)

      await shipPackage(
        outboundPackage,
        preLostResPhysProds,
        "ScannedOnInbound"
      )

      await bagService.processLostItems(preLostBagItemIds)

      postLostResPhysProds = await prismaService.client.reservationPhysicalProduct.findMany(
        {
          where: {
            id: {
              in: preLostResPhysProds.map(a => a.id),
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

      postLostPhysicalProds = postLostResPhysProds.map(a => a.physicalProduct)
      postLostProductVariants = postLostPhysicalProds.map(a => a.productVariant)
    })

    it("removes bag items from customer's bag", async () => {
      const postLostBagItems = await prismaService.client.bagItem.findMany({
        where: {
          id: {
            in: preLostBagItemIds,
          },
        },
      })

      expect(postLostBagItems.length).toBe(0)
    })

    it("sets lostAt on reservationPhysicalProducts", () => {
      postLostResPhysProds.forEach(a => expect(!!a.lostAt).toBe(true))
    })
    it("sets hasBeenLost on reservationPhysicalProducts", () => {
      postLostResPhysProds.forEach(a => expect(a.hasBeenLost).toBe(true))
    })
    it("sets lostInPhase on reservationPhysicalProducts", () => {
      postLostResPhysProds.forEach(a =>
        expect(a.lostInPhase).toBe("CustomerToBusiness")
      )
    })

    it("updates productVariant counts", () => {
      postLostProductVariants.forEach((productVariant, index) => {
        const preLostProdVariant = preLostProductVariants[index]
        expect(preLostProdVariant.nonReservable + 1).toBe(
          productVariant.nonReservable
        )
        expect(preLostProdVariant.reserved - 1).toBe(productVariant.reserved)
      })
    })

    it("sets physicalProduct inventoryStatus to NonReservable", () => {
      postLostPhysicalProds.every(a =>
        expect(a.inventoryStatus).toBe("NonReservable")
      )
    })

    it("sets physicalProduct productStatus to Lost", () => {
      postLostPhysicalProds.every(a => expect(a.productStatus).toBe("Lost"))
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

  // describe("Properly throws errors when the right conditions aren't met", () => {
  //   beforeEach(async () => {
  //     const {
  //       reservation,
  //       bagItems,
  //     } = await reservationTestUtils.addToBagAndReserveForCustomer({
  //       customer: testCustomer,
  //       numProductsToAdd: 3,
  //       options: { shippingCode: "UPSGround" },
  //     })

  //     await setReservationCreatedAt(reservation.id, 10, {
  //       prisma: prismaService,
  //       timeUtils,
  //     })

  //     const transactionID = cuid()
  //     outboundPackage = await prismaService.client.package.create({
  //       data: {
  //         reservationOnSentPackage: {
  //           connect: {
  //             id: reservation.id,
  //           },
  //         },
  //         transactionID,
  //       },
  //     })

  //     preLostBagItems = await prismaService.client.bagItem.findMany({
  //       where: {
  //         id: {
  //           in: bagItems.map(a => a.id),
  //         },
  //       },
  //       select: {
  //         id: true,
  //         reservationPhysicalProduct: {
  //           select: {
  //             id: true,
  //             hasBeenLost: true,
  //             lostInPhase: true,
  //             lostAt: true,
  //           },
  //         },
  //         physicalProduct: {
  //           select: {
  //             id: true,
  //             inventoryStatus: true,
  //             productStatus: true,
  //           },
  //         },
  //         productVariant: {
  //           select: {
  //             id: true,
  //             reserved: true,
  //             reservable: true,
  //             nonReservable: true,
  //           },
  //         },
  //       },
  //     })
  //     preLostBagItemIds = preLostBagItems.map(a => a.id)
  //   })
  //   it("throws an error when the items don't have the correct status", () => {
  //     const processLostItems = async () => {
  //       await bagService.processLostItems(preLostBagItemIds)
  //     }
  //     expect(processLostItems()).rejects.toThrowError(
  //       "Only inbound, outbound, or delivered items can be marked as lost"
  //     )
  //   })
  // })
})
