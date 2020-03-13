import { Test } from "@nestjs/testing"
import { ProductQueriesResolver } from "../queries/product.queries.resolver"
import { PrismaModule } from "../../../prisma/prisma.module"
import { UserModule } from "../.."
import { AirtableModule } from "../../Airtable/airtable.module"
import { EmailModule } from "../../Email/email.module"
import { ShippingModule } from "../../Shipping/shipping.module"
import { ProductService } from "../services/product.service"
import { ProductUtilsService } from "../services/product.utils.service"
import { PhysicalProductService } from "../services/physicalProduct.utils.service"
import { ProductVariantService } from "../services/productVariant.service"
import { ReservationUtilsService } from "../services/reservation.utils.service"
import { ProductFieldsResolver } from "../fields/product.fields.resolver"
import { ProductMutationsResolver } from "../mutations/product.mutations.resolver"
import { ProductVariantFieldsResolver } from "../fields/productVariant.fields.resolver"
import { ProductVariantQueriesResolver } from "../queries/productVariant.queries.resolver"
import { ProductVariantMutationsResolver } from "../mutations/productVariant.mutations.resolver"
import { PrismaClientService } from "../../../prisma/client.service"
import { DBService } from "../../../prisma/db.service"
import { ReservationService } from "../services/reservation.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { AirtableUtilsService } from "../../Airtable/services/airtable.utils.service"
import { ShippingService } from "../../Shipping/services/shipping.service"
import { EmailService } from "../../Email/services/email.service"
import { UtilsService } from "../../Utils/utils.service"
import { EmailDataProvider } from "../../Email/services/email.data.service"

describe("Reservation Service", () => {
  let reservationService: ReservationService
  let prismaService: PrismaClientService

  beforeAll(async () => {
    const dbService = new DBService()
    prismaService = new PrismaClientService()
    const physProdService = new PhysicalProductService(dbService, prismaService)
    const airtableService = new AirtableService(new AirtableUtilsService())
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
      console.log("about to create new customer")
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
      console.log("new customer created")
      newCustomer = await prismaService.client.customer({ id: newCustomer.id })
      const newUser = await prismaService.client.user({
        id: await prismaService.client
          .customer({ id: newCustomer.id })
          .user()
          .id(),
      })
      const returnData = await reservationService.reserveItems(
        reservableProductVariants.slice(0, 3).map(a => a.id),
        newUser,
        newCustomer,
        `{
            id
        }`
      )
      console.log(reservableProductVariants.length)
      console.log(returnData)
      expect(returnData.id).toBe("yo")
    })
  })
})
