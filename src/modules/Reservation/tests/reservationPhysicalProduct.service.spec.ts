import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { Customer } from "@prisma/client"

import { ReservationModuleRef } from "../reservation.module"
import { ReservationPhysicalProductService } from "../services/reservationPhysicalProduct.service"
import { ReservationTestUtilsService } from "./reservation.test.utils"

describe("Reservation Physical Product Service", () => {
  let reservationPhysicalProductService: ReservationPhysicalProductService
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

    const { customer } = await testService.createTestCustomer()

    testCustomer = customer
  })

  describe("Pick and Pack Items", () => {
    let pickedBagItemIDs: string[] = null

    it("Changes items from status Queued to Picked", async () => {
      const {
        bagItems,
      } = await reservationUtilsTestService.addToBagAndReserveForCustomer({
        customer: testCustomer,
        numProductsToAdd: 2,
      })

      const bagItemIDs = bagItems.map(bagItem => bagItem.id)
      pickedBagItemIDs = bagItemIDs

      const bagItemsWithReservationPhysicalProducts = await prisma.client.bagItem.findMany(
        {
          where: {
            id: {
              in: bagItemIDs,
            },
          },
          select: {
            id: true,
            reservationPhysicalProduct: {
              select: {
                status: true,
              },
            },
          },
        }
      )

      for (let bagItem of bagItemsWithReservationPhysicalProducts) {
        expect(bagItem.reservationPhysicalProduct.status).toBe("Queued")
      }

      const result = await reservationPhysicalProductService.pickItems(
        testCustomer.id,
        {
          id: true,
          status: true,
        }
      )

      for (let reservationPhysicalProduct of result) {
        expect(reservationPhysicalProduct.status).toBe("Picked")
      }
    })

    it("Changes items from status Picked to Packed", async () => {
      const bagItemsWithReservationPhysicalProducts = await prisma.client.bagItem.findMany(
        {
          where: {
            id: {
              in: pickedBagItemIDs,
            },
          },
          select: {
            id: true,
            reservationPhysicalProduct: {
              select: {
                status: true,
              },
            },
          },
        }
      )

      for (let bagItem of bagItemsWithReservationPhysicalProducts) {
        expect(bagItem.reservationPhysicalProduct.status).toBe("Picked")
      }

      const result = await reservationPhysicalProductService.packItems(
        testCustomer.id,
        {
          id: true,
          status: true,
        }
      )

      for (let reservationPhysicalProduct of result) {
        expect(reservationPhysicalProduct.status).toBe("Packed")
      }
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

      await reservationPhysicalProductService.pickItems(testCustomer.id, {
        id: true,
        status: true,
      })

      await reservationPhysicalProductService.packItems(testCustomer.id, {
        id: true,
        status: true,
      })

      return [
        bagItems,
        await reservationPhysicalProductService.generateShippingLabels(
          testCustomer.id,
          {
            id: true,
            status: true,
            shippingMethod: true,
          }
        ),
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
        expect(rpp.physicalProduct.packages.length).toBeGreaterThanOrEqual(2)
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
