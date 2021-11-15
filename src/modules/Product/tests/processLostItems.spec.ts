import {
  addToBagAndReserveForCustomer,
  setPackageDeliveredAt,
  setPackageEnteredSystemAt,
  setReservationCreatedAt,
  setReservationStatus,
} from "@app/modules/Payment/tests/utils/utils"
import { ReservationPhysicalProductService } from "@app/modules/Reservation"
import { ReserveService } from "@app/modules/Reservation/services/reserve.service"
import { TestUtilsService } from "@app/modules/Test/services/test.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { PrimaryRegistryAliasFlag } from "aws-sdk/clients/ecrpublic"

import { ProductModuleDef } from "../product.module"
import { BagService } from "../services/bag.service"

describe("Mark Items as Lost", () => {
  let prismaService: PrismaService
  let bagService: BagService
  let testUtils: TestUtilsService
  let reserveService: ReserveService
  let timeUtils: TimeUtilsService
  let reservation
  let cleanupFuncs = []
  let testCustomer

  beforeAll(async done => {
    const moduleBuilder = await Test.createTestingModule(ProductModuleDef)
    const moduleRef = await moduleBuilder.compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    bagService = moduleRef.get<BagService>(BagService)
    testUtils = moduleRef.get<TestUtilsService>(TestUtilsService)
    reserveService = moduleRef.get<ReserveService>(ReserveService)
    timeUtils = moduleRef.get<TimeUtilsService>(TimeUtilsService)
  })

  beforeEach(async () => {
    const { cleanupFunc, customer } = await testUtils.createTestCustomer({})
    cleanupFuncs.push(cleanupFunc)
    testCustomer = customer

    reservation = await addToBagAndReserveForCustomer(testCustomer.id, 2, {
      prisma: prismaService,
      reserveService,
    })
  })

  it("removes bag items from customer's bag", async () => {
    /**
     * create customer
     * place reservation(add items to bag, make reservation)
     * ship reservation to customer
     * mark items as lost
     * check to see if items were removed from customer's bag
     */

    await setReservationCreatedAt(reservation.id, 4, {
      prisma: prismaService,
      timeUtils,
    })
    let reservationPackage = reservation.sentPackage
    await setPackageEnteredSystemAt(reservationPackage, 2, {
      prisma: prismaService,
      timeUtils,
    })

    const preLostBagItems = await prismaService.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          reservation: {
            id: reservation.id,
          },
        },
      },
      select: {
        id: true,
      },
    })

    await bagService.processLostItems({ preLostBagItems })

    const postLostBagItems = await prismaService.client.bagItem.findMany({
      where: {
        id: {
          in: preLostBagItems.map(a => a.id),
        },
      },
    })
    expect(postLostBagItems.length).toBe(0)
  })

  it("sets the lostAt, isLost for relevant reservationPhysicalProducts", async () => {
    /**
     * create reservation
     * place reservation
     * ship reservation
     * mark items as lost
     * check to see if reservationPhysicalProduct's lostAt time stamp has been set
     * check to see if reservationPhysicalProduct's isLost boolean has been set
     */

    await setReservationCreatedAt(reservation.id, 4, {
      prisma: prismaService,
      timeUtils,
    })
    const sentPackage = reservation.sentPackage
    await setPackageEnteredSystemAt(sentPackage.id, 2, {
      prisma: prismaService,
      timeUtils,
    })
    const bagItems = await prismaService.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          reservation: {
            id: reservation.id,
          },
        },
      },
    })

    await bagService.processLostItems(bagItems.map(a => a.id))

    const lostResPhysProds = await prismaService.client.reservationPhysicalProduct.findMany(
      {
        where: {
          reservation: {
            id: reservation.id,
          },
        },
        select: {
          lostAt: true,
          hasBeenLost: true,
        },
      }
    )

    for (const reservationPhysProd of lostResPhysProds) {
      expect(reservationPhysProd.hasBeenLost).toBe(true)
      expect(!!reservationPhysProd.lostAt).toBe(true)
    }
  })

  it("sets lostInPhase for outbound ppackage as BusinessToCustomer", async () => {
    /**
     * create reservation
     * place reservation
     * ship reservation to customer
     * mark items as lost
     * check to see that lostInPhase is set to BusinessToCustomer
     */
    await setReservationCreatedAt(reservation.id, 4, {
      prisma: prismaService,
      timeUtils,
    })
    const sentPackage = reservation.sentPackage
    await setPackageEnteredSystemAt(sentPackage.id, 2, {
      prisma: prismaService,
      timeUtils,
    })
    const bagItems = await prismaService.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          reservation: {
            id: reservation.id,
          },
        },
      },
    })
    await bagService.processLostItems(bagItems.map(a => a.id))

    const lostResPhysProds = await prismaService.client.reservationPhysicalProduct.findMany(
      {
        where: {
          reservation: {
            id: reservation.id,
          },
        },
        select: {
          lostInPhase: true,
        },
      }
    )

    for (const reservationPhysProds of lostResPhysProds) {
      expect(reservationPhysProds.lostInPhase).toBe("BusinessToCustomer")
    }
  })

  it("sets lostInPhase for inbound package to CustomerToBusiness", async () => {
    /**
     * create reservation
     * place reservation
     * ship reservation to customer
     * set package as delivered
     * ship reservation back to business
     * mark items as lost
     * check to see that lostInPhase is set to CustomerToBusiness
     */

    await setReservationCreatedAt(reservation.id, 25, {
      prisma: prismaService,
      timeUtils,
    })
    const sentPackage = reservation.sentPackage
    await setPackageEnteredSystemAt(sentPackage.id, 23, {
      prisma: prismaService,
      timeUtils,
    })
    const bagItems = await prismaService.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          reservation: {
            id: reservation.id,
          },
        },
      },
    })
    await setPackageDeliveredAt(sentPackage.id, 21, {
      prisma: prismaService,
      timeUtils,
    })

    await setPackageEnteredSystemAt(reservation.returnPackage, 5, {
      prisma: prismaService,
      timeUtils,
    })

    const lostResPhysProds = await prismaService.client.reservationPhysicalProduct.findMany(
      {
        where: {
          reservation: {
            id: reservation.id,
          },
        },
        select: {
          lostInPhase: true,
        },
      }
    )

    for (const reservationPhysProds of lostResPhysProds) {
      expect(reservationPhysProds.lostInPhase).toBe("CustomerToBusiness")
    }
  })

  it("updates product variant counts", async () => {
    /**
     * create reservation
     * place reservation
     * ship reservation
     * mark items as lost
     * check product variant counts
     */
    await setReservationCreatedAt(reservation.id, 25, {
      prisma: prismaService,
      timeUtils,
    })
    const sentPackage = reservation.sentPackage
    await setPackageEnteredSystemAt(sentPackage.id, 23, {
      prisma: prismaService,
      timeUtils,
    })
    const bagItems = await prismaService.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          reservation: {
            id: reservation.id,
          },
        },
      },
    })

    await bagService.processLostItems(bagItems.map(a => a.id))

    const postLostProductVariants = await prismaService.client.productVariant.findMany(
      {
        where: {
          physicalProducts: {
            some: {
              reservationPhysicalProduct: {
                some: {
                  reservationId: reservation.id,
                },
              },
            },
          },
        },
        select: {
          reservable: true,
          reserved: true,
          nonReservable: true,
        },
      }
    )
    for (const productVariant of postLostProductVariants) {
      expect(productVariant.nonReservable).toBe(
        productVariant.nonReservable - 1
      )
    }
  })

  it("sets physicalProduct inventory status to NonReservable and product status to lost", async () => {
    /**
     * create reseravtion
     * place reservation
     * ship reservation
     * mark items as lost
     * check physicalProduct inventory status
     */

    await setReservationCreatedAt(reservation.id, 25, {
      prisma: prismaService,
      timeUtils,
    })
    const sentPackage = reservation.sentPackage
    await setPackageEnteredSystemAt(sentPackage.id, 23, {
      prisma: prismaService,
      timeUtils,
    })
    const bagItems = await prismaService.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          reservation: {
            id: reservation.id,
          },
        },
      },
    })
    await bagService.processLostItems(bagItems.map(a => a.id))

    const lostPhysicalProducts = await prismaService.client.physicalProduct.findMany(
      {
        where: {
          reservationPhysicalProduct: {
            some: {
              reservation: {
                id: reservation.id,
              },
            },
          },
        },
        select: {
          inventoryStatus: true,
          productStatus: true,
        },
      }
    )

    for (const lostPhysProd of lostPhysicalProducts) {
      expect(lostPhysProd.inventoryStatus).toBe("NonReservable")
      expect(lostPhysProd.productStatus).toBe("Lost")
    }
  })
})
