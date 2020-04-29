import { AirtableInventoryStatus } from "@app/modules/Airtable/airtable.types"
import { EmailDataProvider, EmailService } from "@app/modules/Email"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ProductCountAndStatusSummary } from "@app/modules/Utils/utils.types"
import {
  AirtableBaseService,
  AirtableService,
  AirtableUtilsService,
} from "@modules/Airtable"
import { TestUtilsService } from "@modules/Utils/services/test.service"
import { Customer, User } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import * as Airtable from "airtable"
import { head, isEqual, sample, sampleSize } from "lodash"

import { ReservationScheduledJobs } from ".."

const ONE_MIN = 60000

describe("Return Flow Cron Job", () => {
  let reservationService: ReservationService
  let prismaService: PrismaService
  let testUtilsService: TestUtilsService
  let testUser: User
  let testCustomer: Customer
  let reservationJobsService: ReservationScheduledJobs
  let airtableService: AirtableService

  beforeAll(async () => {
    Airtable.configure({
      endpointUrl: "https://api.airtable.com",
      apiKey: process.env.AIRTABLE_KEY,
    })

    prismaService = new PrismaService()

    const airtableBaseService = new AirtableBaseService()
    airtableService = new AirtableService(
      airtableBaseService,
      new AirtableUtilsService(airtableBaseService)
    )

    testUtilsService = new TestUtilsService(prismaService, airtableService)
    ;({ reservationService } = testUtilsService.createReservationService())

    const utilsService = new UtilsService(prismaService)
    reservationJobsService = new ReservationScheduledJobs(
      airtableService,
      new EmailService(prismaService, utilsService, new EmailDataProvider()),
      prismaService,
      new ShippingService(prismaService, utilsService),
      new ErrorService()
    )
  })

  describe("mark physical product reservable", () => {
    let testPrismaProdVar
    let testAirtableProdVar
    let testPrismaPhysicalProduct
    let testAirtablePhysicalProduct
    let expectedFinalState: ProductCountAndStatusSummary

    beforeAll(async () => {
      const reservedProductVariants = await testUtilsService.getTestableReservedProductVariants(`
      {
          id
          sku
          total
          reserved
          reservable
          nonReservable
          physicalProducts {
            id
            seasonsUID
          }
        }
      `)

      // Ensure the prisma product variant and airtable product variant are synced before running
      testPrismaProdVar = sample(reservedProductVariants) as any
      testPrismaPhysicalProduct = await prismaService.client.physicalProduct({
        seasonsUID: testPrismaProdVar.physicalProducts[0]?.seasonsUID,
      })
      const getCorrespondingTestProdVar = async () =>
        await airtableService.getCorrespondingAirtableProductVariant(
          await airtableService.getAllProductVariants(),
          testPrismaProdVar
        )
      const getCorrespondingTestPhysicalProduct = async () =>
        await airtableService.getCorrespondingAirtablePhysicalProduct(
          await airtableService.getAllPhysicalProducts(),
          testPrismaPhysicalProduct
        )
      testAirtableProdVar = await getCorrespondingTestProdVar()
      testAirtablePhysicalProduct = await getCorrespondingTestPhysicalProduct()
      const updateTestAirtablePhysicalProduct = async (
        inventoryStatus: AirtableInventoryStatus
      ) =>
        await airtableService.updatePhysicalProducts(
          [testAirtablePhysicalProduct.id],
          [
            {
              "Inventory Status": inventoryStatus,
            },
          ]
        )
      const initialPrismaState = testUtilsService.summarizePrismaCountsAndStatus(
        testPrismaProdVar,
        testPrismaPhysicalProduct
      )
      if (
        !isEqual(
          initialPrismaState,
          testUtilsService.summarizeAirtableCountsAndStatus(
            testAirtableProdVar,
            testAirtablePhysicalProduct
          )
        )
      ) {
        await updateTestAirtablePhysicalProduct(
          airtableService.prismaToAirtableInventoryStatus(
            testPrismaPhysicalProduct.inventoryStatus
          )
        )
        await airtableService.updateProductVariantCounts(
          testAirtableProdVar.id,
          {
            "Reservable Count": testPrismaProdVar.reservable,
            "Reserved Count": testPrismaProdVar.reserved,
            "Non-Reservable Count": testPrismaProdVar.nonReservable,
          }
        )
        testAirtableProdVar = await getCorrespondingTestProdVar()
        testAirtablePhysicalProduct = await getCorrespondingTestPhysicalProduct()
      }
      if (
        !isEqual(
          testUtilsService.summarizeAirtableCountsAndStatus(
            testAirtableProdVar,
            testAirtablePhysicalProduct
          ),
          initialPrismaState
        )
      ) {
        throw new Error("Unable to create valid initial state")
      }

      // Edit the airtable physical product
      await updateTestAirtablePhysicalProduct("Reservable")

      // Run the cron job
      await reservationJobsService.syncPhysicalProductAndReservationStatuses()

      // Get updated values
      testPrismaProdVar = await prismaService.client.productVariant({
        id: testPrismaProdVar.id,
      })
      testPrismaPhysicalProduct = await prismaService.client.physicalProduct({
        id: testPrismaPhysicalProduct.id,
      })
      testAirtableProdVar = await getCorrespondingTestProdVar()
      testAirtablePhysicalProduct = await getCorrespondingTestPhysicalProduct()

      expectedFinalState = {
        ...initialPrismaState,
        reserved: initialPrismaState.reserved - 1,
        reservable: initialPrismaState.reservable + 1,
        status: "Reservable",
      }
    }, 10 * ONE_MIN)

    it("Updates prisma counts and status", () => {
      expect(
        testUtilsService.summarizePrismaCountsAndStatus(
          testPrismaProdVar,
          testPrismaPhysicalProduct
        )
      ).toStrictEqual(expectedFinalState)
    })

    it("Updates airtable counts", () => {
      expect(
        testUtilsService.summarizeAirtableCountsAndStatus(
          testAirtableProdVar,
          testAirtablePhysicalProduct
        )
      ).toStrictEqual(expectedFinalState)
    })

    it("Doesn't create impossible counts", () => {
      expect(expectedFinalState.reservable).toBeGreaterThanOrEqual(1)
      expect(expectedFinalState.reserved).toBeGreaterThanOrEqual(0)
      expect(expectedFinalState.nonReservable).toBeGreaterThanOrEqual(0)
    })
  })

  describe("mark reservation completed after sync physical product script finishes", () => {
    let productVariantsToReserveIds
    let itemToReturn
    let returnedItem
    let updatedReservation
    let createdReservationData

    beforeAll(async () => {
      ;({
        user: testUser,
        customer: testCustomer,
      } = await testUtilsService.createNewTestingCustomer())
      productVariantsToReserveIds = sampleSize(
        await testUtilsService.getTestableReservableProductVariants(),
        3
      ).map(a => a.id)
      testUtilsService.initializePreReservationCustomerBag(
        productVariantsToReserveIds,
        testCustomer,
        true
      )

      // Create a reservation
      createdReservationData = await reservationService.reserveItems(
        productVariantsToReserveIds,
        testUser,
        testCustomer,
        `{
            id
            reservationNumber
            products {
              id
              seasonsUID
              productVariant {
                total
                nonReservable
                reserved
                reservable
              }
            }
          }`
      )

      // Return 1 item on airtable
      itemToReturn = sample(createdReservationData.products)
      const correspondingAirtablePhysicalProduct = airtableService.getCorrespondingAirtablePhysicalProduct(
        await airtableService.getAllPhysicalProducts(),
        itemToReturn
      )
      await airtableService.updatePhysicalProducts(
        [correspondingAirtablePhysicalProduct.id],
        [{ "Inventory Status": "Reservable" }]
      )
      await airtableService.updateReservation(
        createdReservationData.reservationNumber,
        { Status: "Completed" }
      )

      // Run the cron job
      await reservationJobsService.syncPhysicalProductAndReservationStatuses(
        true
      )

      updatedReservation = await prismaService.binding.query.reservation(
        {
          where: { id: createdReservationData.id },
        },
        `{
          id
          status
          returnedPackage {
            items {
              id
              seasonsUID
            }
          }
        }`
      )
      returnedItem = await prismaService.binding.query.physicalProduct(
        {
          where: { id: itemToReturn.id },
        },
        `{
          seasonsUID
          inventoryStatus
          productVariant {
            reservable
            reserved
          }
        }`
      )
    }, 10 * ONE_MIN)

    afterAll(async () => {
      await prismaService.client.deleteReservation({
        id: createdReservationData?.id,
      })
      await prismaService.client.deleteManyBagItems({
        customer: { id: testCustomer.id },
      })
      await prismaService.client.deleteCustomer({ id: testCustomer.id })
      await prismaService.client.deleteManyReservationFeedbacks({
        user: { id: testUser.id },
      })
      await prismaService.client.deleteUser({ id: testUser.id })
    })

    it("updates reservation status", () => {
      expect(updatedReservation.status).toBe("Completed")
    })

    it("updates returned package data", () => {
      //@ts-ignore
      expect(head(updatedReservation.returnedPackage.items)?.seasonsUID).toBe(
        returnedItem.seasonsUID
      )
    })

    it("deletes bag items", async () => {
      expect(
        await prismaService.client.bagItems({
          where: {
            productVariant: {
              id_in: productVariantsToReserveIds,
            },
            customer: {
              id: testCustomer.id,
            },
            status: "Added",
          },
        })
      ).toHaveLength(3)
      expect(
        await prismaService.client.bagItems({
          where: {
            productVariant: { id_in: productVariantsToReserveIds },
            customer: {
              id: testCustomer.id,
            },
            status: "Reserved",
          },
        })
      ).toHaveLength(2)
    })

    it("creates reservation feedback object", async () => {
      expect(
        await prismaService.client.reservationFeedbacks({
          where: { reservation: { id: createdReservationData.id } },
        })
      ).toBeDefined()
    })
  })

  describe("mark reservation completed", () => {
    let productVariantsToReserveIds
    let itemToReturn
    let returnedItem
    let updatedReservation
    let createdReservationData

    beforeAll(async () => {
      ;({
        user: testUser,
        customer: testCustomer,
      } = await testUtilsService.createNewTestingCustomer())
      productVariantsToReserveIds = sampleSize(
        await testUtilsService.getTestableReservableProductVariants(),
        3
      ).map(a => a.id)
      testUtilsService.initializePreReservationCustomerBag(
        productVariantsToReserveIds,
        testCustomer,
        true
      )

      // Create a reservation
      createdReservationData = await reservationService.reserveItems(
        productVariantsToReserveIds,
        testUser,
        testCustomer,
        `{
            id
            reservationNumber
            products {
              id
              seasonsUID
              productVariant {
                total
                nonReservable
                reserved
                reservable
              }
            }
          }`
      )

      // Return 1 item on airtable
      itemToReturn = sample(createdReservationData.products)
      const correspondingAirtablePhysicalProduct = airtableService.getCorrespondingAirtablePhysicalProduct(
        await airtableService.getAllPhysicalProducts(),
        itemToReturn
      )
      await airtableService.updatePhysicalProducts(
        [correspondingAirtablePhysicalProduct.id],
        [{ "Inventory Status": "Reservable" }]
      )
      await airtableService.updateReservation(
        createdReservationData.reservationNumber,
        { Status: "Completed" }
      )

      // Run the cron job
      await reservationJobsService.syncPhysicalProductAndReservationStatuses()

      updatedReservation = await prismaService.binding.query.reservation(
        {
          where: { id: createdReservationData.id },
        },
        `{
          id
          status
          returnedPackage {
            items {
              id
              seasonsUID
            }
          }
        }`
      )
      returnedItem = await prismaService.binding.query.physicalProduct(
        {
          where: { id: itemToReturn.id },
        },
        `{
          seasonsUID
          inventoryStatus
          productVariant {
            reservable
            reserved
          }
        }`
      )
    }, 10 * ONE_MIN)

    afterAll(async () => {
      await prismaService.client.deleteReservation({
        id: createdReservationData?.id,
      })
      await prismaService.client.deleteManyBagItems({
        customer: { id: testCustomer.id },
      })
      await prismaService.client.deleteCustomer({ id: testCustomer.id })
      await prismaService.client.deleteManyReservationFeedbacks({
        user: { id: testUser.id },
      })
      await prismaService.client.deleteUser({ id: testUser.id })
    })

    it("updates reservation status", () => {
      expect(updatedReservation.status).toBe("Completed")
    })

    it("updates returned package data", () => {
      //@ts-ignore
      expect(head(updatedReservation.returnedPackage.items)?.seasonsUID).toBe(
        returnedItem.seasonsUID
      )
    })

    it("deletes bag items", async () => {
      expect(
        await prismaService.client.bagItems({
          where: {
            productVariant: {
              id_in: productVariantsToReserveIds,
            },
            customer: {
              id: testCustomer.id,
            },
            status: "Added",
          },
        })
      ).toHaveLength(3)
      expect(
        await prismaService.client.bagItems({
          where: {
            productVariant: { id_in: productVariantsToReserveIds },
            customer: {
              id: testCustomer.id,
            },
            status: "Reserved",
          },
        })
      ).toHaveLength(2)
    })

    it("creates reservation feedback object", async () => {
      expect(
        await prismaService.client.reservationFeedbacks({
          where: { reservation: { id: createdReservationData.id } },
        })
      ).toBeDefined()
    })
  })
})
