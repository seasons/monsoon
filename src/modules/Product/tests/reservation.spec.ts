import { ProductUtilsService } from "../services/product.utils.service"
import { PhysicalProductService } from "../services/physicalProduct.utils.service"
import { ProductVariantService } from "../services/productVariant.service"
import { ReservationUtilsService } from "../services/reservation.utils.service"
import { PrismaClientService } from "../../../prisma/client.service"
import { DBService } from "../../../prisma/db.service"
import { ReservationService } from "../services/reservation.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { AirtableUtilsService } from "../../Airtable/services/airtable.utils.service"
import { ShippingService } from "../../Shipping/services/shipping.service"
import { EmailService } from "../../Email/services/email.service"
import { UtilsService } from "../../Utils/utils.service"
import { EmailDataProvider } from "../../Email/services/email.data.service"
import { AirtableBaseService } from "../../Airtable/services/airtable.base.service"
import * as Airtable from "airtable"
import { TestUtilsService } from "../../Utils/test.service"
import { Customer, User } from "../../../prisma"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let prismaService: PrismaClientService
  let airtableService: AirtableService
  let testUtilsService: TestUtilsService
  let testUser: User
  let testCustomer: Customer

  beforeAll(async () => {
    Airtable.configure({
      endpointUrl: "https://api.airtable.com",
      apiKey: process.env.AIRTABLE_KEY,
    })

    const dbService = new DBService()
    prismaService = new PrismaClientService()
    const physProdService = new PhysicalProductService(dbService, prismaService)
    const airtableBaseService = new AirtableBaseService()
    airtableService = new AirtableService(
      airtableBaseService,
      new AirtableUtilsService(airtableBaseService)
    )
    const utilsService = new UtilsService(prismaService)
    reservationService = new ReservationService(
      dbService,
      prismaService,
      new ProductUtilsService(dbService, prismaService),
      new ProductVariantService(
        prismaService,
        physProdService,
        airtableService
      ),
      physProdService,
      airtableService,
      new ShippingService(prismaService, utilsService),
      new EmailService(prismaService, utilsService, new EmailDataProvider()),
      new ReservationUtilsService()
    )
    testUtilsService = new TestUtilsService(prismaService, airtableService)
  })

  beforeEach(async () => {
    const { user, customer } = await testUtilsService.createNewTestingCustomer()
    testUser = user
    testCustomer = customer
  })

  describe("reserveItems", () => {
    it("should create a reservation", async () => {
      const reservableProductVariants = await prismaService.client.productVariants(
        {
          where: { reservable_gt: 0 },
        }
      )
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
      const reservableProductVariants = await prismaService.client.productVariants(
        {
          where: { reservable_gt: 0 },
        }
      )
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
