import * as Airtable from "airtable"

import { Customer, User } from "@prisma/index"

import { AirtableBaseService } from "@modules/Airtable/services/airtable.base.service"
import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "@modules/Airtable/services/airtable.utils.service"
import { PrismaService } from "@prisma/prisma.service"
import { ReservationService } from "../services/reservation.service"
import { TestUtilsService } from "@modules/Utils/services/test.service"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let prismaService: PrismaService
  let testUtilsService: TestUtilsService
  let testUser: User
  let testCustomer: Customer
  let reservableProductVariants
  let allAirtablePhysicalProductsSUIDs: string[]

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

    allAirtablePhysicalProductsSUIDs = (
      await airtableService.getAllPhysicalProducts()
    ).map(a => a.model.sUID.text)
  })

  beforeEach(async () => {
    const { user, customer } = await testUtilsService.createNewTestingCustomer()
    testUser = user
    testCustomer = customer
    try {
      reservableProductVariants = await prismaService.binding.query.productVariants(
        {
          where: {
            reservable_gt: 0,
            physicalProducts_some: { inventoryStatus: "Reservable" },
          },
        },
        `{
          id
          physicalProducts {
              seasonsUID
          }
        }`
      )
    } catch (err) {
      console.log(err)
    }
    reservableProductVariants = reservableProductVariants.filter(a => {
      return a.physicalProducts.every(b =>
        allAirtablePhysicalProductsSUIDs.includes(b.seasonsUID)
      )
    })
  })

  afterEach(async () => {
    await prismaService.client.deleteCustomer({ id: testCustomer.id })
    await prismaService.client.deleteUser({ id: testUser.id })
  })

  describe("reserveItems", () => {
    it("should create a reservation", async () => {
      const productVariantsToReserve = reservableProductVariants
        .slice(0, 3)
        .map(a => a.id)
      const returnData = await reservationService.reserveItems(
        productVariantsToReserve,
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

      // Delete the reservation
      await prismaService.client.deleteReservation({ id: returnData.id })

      // Id check -- i.e, it went through
      expect(returnData.id).toMatch(/^ck\w{23}/) // string starting with "ck" and of length 25

      // sentPackage shipping label data looks good
      expect(returnData.sentPackage.shippingLabel.trackingNumber).toBeDefined()
      expect(returnData.sentPackage.shippingLabel.image).toBeDefined()
      expect(returnData.sentPackage.shippingLabel.trackingURL).toBeDefined()

      // returnedPackage shipping label data looks good
      expect(
        returnData.returnedPackage.shippingLabel.trackingNumber
      ).toBeDefined()
      expect(returnData.returnedPackage.shippingLabel.image).toBeDefined()
      expect(returnData.returnedPackage.shippingLabel.trackingURL).toBeDefined()

      // products is what we expect
      expect(returnData.products).toHaveLength(3)
      expect(returnData.products.map(a => a.productVariant.id).sort()).toEqual(
        productVariantsToReserve.sort()
      )
    }, 50000)

    it("should throw an error saying the item is not reservable", async () => {
      const nonReservableProductVariants = await prismaService.client.productVariants(
        {
          where: { reservable: 0 },
        }
      )
      expect(reservableProductVariants.length).toBeGreaterThanOrEqual(2)
      expect(nonReservableProductVariants.length).toBeGreaterThanOrEqual(1)

      const productVariantsToReserve = reservableProductVariants
        .slice(0, 2)
        .map(a => a.id)
      productVariantsToReserve.push(nonReservableProductVariants[0].id)

      expect(
        (async () => {
          return await reservationService.reserveItems(
            productVariantsToReserve,
            testUser,
            testCustomer,
            `{
                  id
              }`
          )
        })()
      ).rejects.toThrow("The following item is not reservable")
    }, 50000)
  })
})
