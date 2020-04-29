import {
  AirtableBaseService,
  AirtableService,
  AirtableUtilsService,
} from "@modules/Airtable"
import { ReservationService } from "@modules/Reservation"
import { TestUtilsService } from "@modules/Utils/services/test.service"
import { Customer, User } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import * as Airtable from "airtable"
import { sample, sampleSize, shuffle } from "lodash"

const ONE_MIN = 60000

describe("Reserve Items", () => {
  let reservationService: ReservationService
  let prismaService: PrismaService
  let testUtilsService: TestUtilsService
  let testUser: User
  let testCustomer: Customer

  beforeAll(async () => {
    Airtable.configure({
      endpointUrl: "https://api.airtable.com",
      apiKey: process.env.AIRTABLE_KEY,
    })

    prismaService = new PrismaService()
    const airtableBaseService = new AirtableBaseService()
    const airtableService = new AirtableService(
      airtableBaseService,
      new AirtableUtilsService(airtableBaseService)
    )
    testUtilsService = new TestUtilsService(prismaService, airtableService)
    ;({ reservationService } = testUtilsService.createReservationService())
  })

  describe("Reservation creation", () => {
    let productVariantsToReserveIds
    let returnData
    let customerBagItemsAfterReservation

    beforeAll(async () => {
      ;({
        user: testUser,
        customer: testCustomer,
      } = await testUtilsService.createNewTestingCustomer())

      productVariantsToReserveIds = sampleSize(
        await testUtilsService.getTestableReservableProductVariants(),
        3
      ).map((a) => a.id)
      testUtilsService.initializePreReservationCustomerBag(
        productVariantsToReserveIds,
        testCustomer,
        true
      )
      returnData = await reservationService.reserveItems(
        productVariantsToReserveIds,
        testUser,
        testCustomer,
        `{
          id
          sentPackage {
              shippingLabel {
                  image
                  trackingNumber
                  trackingURL
              }
          }
          returnedPackage {
              shippingLabel {
                  image
                  trackingNumber
                  trackingURL
              }
          }
          products {
              productVariant {
                  id
              }
          }
        }`
      )
      customerBagItemsAfterReservation = await prismaService.binding.query.bagItems(
        { where: { customer: { id: testCustomer.id } } },
        `{
            id
            productVariant {
                id
            }
            saved
            status
        }`
      )
    }, ONE_MIN)

    afterAll(async () => {
      await prismaService.client.deleteManyBagItems({
        customer: { id: testCustomer.id },
      })
      await prismaService.client.deleteReservation({ id: returnData.id })
      await prismaService.client.deleteCustomer({ id: testCustomer.id })
      await prismaService.client.deleteUser({ id: testUser.id })
    })

    it("runs to completion", () => {
      expect(returnData.id).toMatch(/^ck\w{23}/) // string starting with "ck" and of length 25
    })

    it("creates a sent package", () => {
      expect(returnData.sentPackage.shippingLabel.trackingNumber).toBeDefined()
      expect(returnData.sentPackage.shippingLabel.image).toBeDefined()
      expect(returnData.sentPackage.shippingLabel.trackingURL).toBeDefined()
    })

    it("creates a stub returned package", () => {
      expect(
        returnData.returnedPackage.shippingLabel.trackingNumber
      ).toBeDefined()
      expect(returnData.returnedPackage.shippingLabel.image).toBeDefined()
      expect(returnData.returnedPackage.shippingLabel.trackingURL).toBeDefined()
    })

    it("reserved the expected items", () => {
      expect(returnData.products).toHaveLength(3)
      expect(
        returnData.products.map((a) => a.productVariant.id).sort()
      ).toEqual(productVariantsToReserveIds.sort())
    })

    it("updates the customers bag", () => {
      const reservedItems = customerBagItemsAfterReservation.filter(
        (a) => a.status === "Reserved"
      )
      const addedItems = customerBagItemsAfterReservation.filter(
        (a) => a.status === "Added"
      )
      expect(reservedItems).toHaveLength(3)
      expect(addedItems).toHaveLength(3)
      expect(reservedItems.map((a) => a.productVariant.id).sort()).toEqual(
        productVariantsToReserveIds.sort()
      )
    })
  })

  describe("Reserving an already-reserved product variant", () => {
    let productVariantsToReserveIds

    beforeAll(async () => {
      ;({
        user: testUser,
        customer: testCustomer,
      } = await testUtilsService.createNewTestingCustomer())

      productVariantsToReserveIds = shuffle([
        ...sampleSize(
          await testUtilsService.getTestableReservableProductVariants(),
          2
        ),
        sample(await testUtilsService.getTestableReservedProductVariants()),
      ]).map((a) => a.id)
    }, ONE_MIN)

    afterAll(async () => {
      await prismaService.client.deleteCustomer({ id: testCustomer.id })
      await prismaService.client.deleteUser({ id: testUser.id })
    })

    it("throws an error", () => {
      expect(
        (async () =>
          await reservationService.reserveItems(
            productVariantsToReserveIds,
            testUser,
            testCustomer,
            `{
            id
            }`
          ))()
      ).rejects.toThrow("The following item is not reservable")
    })
  })
})
