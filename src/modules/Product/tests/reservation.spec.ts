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
import { EPERM } from "constants"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let prismaService: PrismaClientService
  let airtableService: AirtableService

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
      new ProductUtilsService(dbService),
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
  })

  describe("reserveItems", () => {
    // TODO: Fill in create prisma customer data
    // TODO: Get product variant ids of three reservable product variants
    //   const returnData = reservationService.reserveItems()
    it("should create a reservation", async () => {
      const reservableProductVariants = await prismaService.client.productVariants(
        {
          where: { reservable_gt: 0 },
        }
      )
      let newCustomer = await prismaService.client.createCustomer({
        user: {
          create: {
            email: `faiyam+${Date.now()}@seasons.nyc`,
            firstName: "Faiyam",
            lastName: "Rahman",
            role: "Customer",
            auth0Id: `auth|${Date.now()}`,
          },
        },
        status: "Active",
        detail: {
          create: {
            shippingAddress: {
              create: {
                slug: `faiyam-rahman-sq${Date.now()}`,
                name: "Faiyam Rahman",
                company: "",
                address1: "43 The Intervale",
                city: "Roslyn Estates",
                state: "New York",
                zipCode: "11576",
                locationType: "Customer",
              },
            },
          },
        },
      })
      newCustomer = await prismaService.client.customer({ id: newCustomer.id })
      const newUser = await prismaService.client.user({
        id: await prismaService.client
          .customer({ id: newCustomer.id })
          .user()
          .id(),
      })
      airtableService.createOrUpdateAirtableUser(newUser, {})
      const productVariantsToReserve = reservableProductVariants
        .slice(0, 3)
        .map(a => a.id)
      const returnData = await reservationService.reserveItems(
        productVariantsToReserve,
        newUser,
        newCustomer,
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
    }, 30000)
  })
})
