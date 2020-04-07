import * as Airtable from "airtable"

import {
  AirtableBaseService,
  AirtableService,
  AirtableUtilsService,
} from "@modules/Airtable"
import { Customer, User } from "@prisma/index"
import { EmailDataProvider, EmailService } from "@app/modules/Email"
import { head, isEqual } from "lodash"

import { AirtableInventoryStatus } from "@app/modules/Airtable/airtable.types"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { PrismaService } from "@prisma/prisma.service"
import { ReservationScheduledJobs } from ".."
import { ReservationService } from "@modules/Product/services/reservation.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { TestUtilsService } from "@modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ProductCountAndStatusSummary } from "@app/modules/Utils/utils.types"

describe("Return Flow Cron Job", () => {
  let reservationService: ReservationService
  let prismaService: PrismaService
  let testUtilsService: TestUtilsService
  let testUser: User
  let testCustomer: Customer
  let reservableProductVariants
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

  beforeEach(async () => {
    const { user, customer } = await testUtilsService.createNewTestingCustomer()
    testUser = user
    testCustomer = customer
    // reservableProductVariants = await testUtilsService.getReservableProductVariants(`
    // {
    //   id
    //   sku
    //   total
    //   reserved
    //   reservable
    //   nonReservable
    //   physicalProducts {
    //     id
    //     seasonsUID
    //   }
    // }
    // `)
  })

  afterEach(async () => {
    await prismaService.client.deleteCustomer({ id: testCustomer.id })
    await prismaService.client.deleteUser({ id: testUser.id })
  })

  describe("sync physical product status", () => {
    it("marking a reserved items as reservable works", async () => {
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
      let testPrismaProdVar = head(reservedProductVariants) as any
      let testPrismaPhysicalProduct = await prismaService.client.physicalProduct(
        { seasonsUID: testPrismaProdVar.physicalProducts[0]?.seasonsUID }
      )
      const getCorrespondingTestProdVar = async () =>
        airtableService.getCorrespondingAirtableProductVariant(
          await airtableService.getAllProductVariants(),
          testPrismaProdVar
        )
      const getCorrespondingTestPhysicalProduct = async () =>
        await airtableService.getCorrespondingAirtablePhysicalProduct(
          await airtableService.getAllPhysicalProducts(),
          testPrismaPhysicalProduct
        )
      let testAirtableProdVar = await getCorrespondingTestProdVar()
      let testAirtablePhysicalProduct = await getCorrespondingTestPhysicalProduct()
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
      }
      testAirtableProdVar = await getCorrespondingTestProdVar()
      testAirtablePhysicalProduct = await getCorrespondingTestPhysicalProduct()
      expect(
        testUtilsService.summarizeAirtableCountsAndStatus(
          testAirtableProdVar,
          testAirtablePhysicalProduct
        )
      ).toStrictEqual(initialPrismaState)

      // Edit the airtable physical product
      await updateTestAirtablePhysicalProduct("Reservable")

      // Run the cron job
      await reservationJobsService.syncPhysicalProductAndReservationStatuses()

      // Confirm it changed
      testPrismaProdVar = await prismaService.client.productVariant({
        id: testPrismaProdVar.id,
      })
      testPrismaPhysicalProduct = await prismaService.client.physicalProduct({
        id: testPrismaPhysicalProduct.id,
      })
      testAirtableProdVar = await getCorrespondingTestProdVar()
      testAirtablePhysicalProduct = await getCorrespondingTestPhysicalProduct()
      const expectedFinalState: ProductCountAndStatusSummary = {
        ...initialPrismaState,
        reserved: initialPrismaState.reserved - 1,
        reservable: initialPrismaState.reservable + 1,
        status: "Reservable",
      }
      expect(
        testUtilsService.summarizeAirtableCountsAndStatus(
          testAirtableProdVar,
          testAirtablePhysicalProduct
        )
      ).toStrictEqual(expectedFinalState)
      expect(
        testUtilsService.summarizePrismaCountsAndStatus(
          testPrismaProdVar,
          testPrismaPhysicalProduct
        )
      ).toStrictEqual(expectedFinalState)
      expect(expectedFinalState.reservable).toBeGreaterThanOrEqual(1)
      expect(expectedFinalState.reserved).toBeGreaterThanOrEqual(0)
      expect(expectedFinalState.nonReservable).toBeGreaterThanOrEqual(0)
    }, 500000)
  })

  // describe("sync reservation status", () => {
  //   it("properly returns an item, including bag item deletions, feedback survey data creation, status updating, return package updating", async () => {})
  // })
})
