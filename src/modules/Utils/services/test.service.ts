import { AirtableBaseService, AirtableUtilsService } from "@modules/Airtable"
import { Customer, User } from "@prisma/index"
import { EmailDataProvider, EmailService } from "@modules/Email"

import { AirtableService } from "@modules/Airtable/index"
import { PhysicalProductService } from "@modules/Product/services/physicalProduct.utils.service"
import { PrismaService } from "@prisma/prisma.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { ProductVariantService } from "@modules/Product/services/productVariant.service"
import { ReservationService } from "@modules/Product/services/reservation.service"
import { ReservationUtilsService } from "@modules/Product/services/reservation.utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { UtilsService } from "./utils.service"
import { ProductCountAndStatusSummary } from "../utils.types"

export class TestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly airtableService: AirtableService
  ) {}

  async createNewTestingCustomer(): Promise<{
    user: User
    customer: Customer
  }> {
    let newCustomer = await this.prisma.client.createCustomer({
      user: {
        create: {
          email: `membership+${Date.now()}@seasons.nyc`,
          firstName: "SamTest",
          lastName: "JohnsonTest",
          role: "Customer",
          auth0Id: `auth|${Date.now()}`,
        },
      },
      status: "Active",
      detail: {
        create: {
          shippingAddress: {
            create: {
              slug: `sam-johnson-test-sq${Date.now()}`,
              name: "Sam Johnson Test",
              company: "",
              address1: "138 Mulberry St",
              city: "New York",
              state: "New York",
              zipCode: "10013",
              locationType: "Customer",
            },
          },
        },
      },
    })
    newCustomer = await this.prisma.client.customer({ id: newCustomer.id })
    const newUser = await this.prisma.client.user({
      id: await this.prisma.client
        .customer({ id: newCustomer.id })
        .user()
        .id(),
    })
    this.airtableService.createOrUpdateAirtableUser(newUser, {})

    return { user: newUser, customer: newCustomer }
  }

  createReservationService() {
    const physProdService = new PhysicalProductService(this.prisma)
    const airtableBaseService = new AirtableBaseService()
    const airtableService = new AirtableService(
      airtableBaseService,
      new AirtableUtilsService(airtableBaseService)
    )
    const utilsService = new UtilsService(this.prisma)
    const reservationService = new ReservationService(
      this.prisma,
      new ProductUtilsService(this.prisma),
      new ProductVariantService(this.prisma, physProdService, airtableService),
      physProdService,
      airtableService,
      new ShippingService(this.prisma, utilsService),
      new EmailService(this.prisma, utilsService, new EmailDataProvider()),
      new ReservationUtilsService()
    )

    return { reservationService }
  }

  async getTestableReservableProductVariants(info?) {
    return await this.getTestableProductVariants(
      {
        where: {
          reservable_gt: 0,
          physicalProducts_some: { inventoryStatus: "Reservable" },
        },
      },
      info
    )
  }

  async getTestableReservedProductVariants(info?) {
    return await this.getTestableProductVariants(
      {
        where: {
          reserved_gt: 0,
          physicalProducts_some: { inventoryStatus: "Reserved" },
        },
      },
      info
    )
  }

  summarizePrismaCountsAndStatus(
    prismaProdVar,
    prismaPhysicalProduct
  ): ProductCountAndStatusSummary {
    return {
      total: prismaProdVar.total,
      reserved: prismaProdVar.reserved,
      reservable: prismaProdVar.reservable,
      nonReservable: prismaProdVar.nonReservable,
      status: prismaPhysicalProduct.inventoryStatus,
    }
  }

  summarizeAirtableCountsAndStatus(
    airtableProdVar,
    airtablePhysicalProduct
  ): ProductCountAndStatusSummary {
    return {
      total: airtableProdVar.model.totalCount,
      reserved: airtableProdVar.model.reservedCount,
      reservable: airtableProdVar.model.reservableCount,
      nonReservable: airtableProdVar.model["non-ReservableCount"],
      status: airtablePhysicalProduct.model.inventoryStatus,
    }
  }

  /**
   * Returns a list of all product variants which
   * a) have corresponding records in airtable
   * b) have physical products that have corresponding records in airtable
   */
  private async getTestableProductVariants(args, info) {
    const allAirtablePhysicalProductsSUIDs = (
      await this.airtableService.getAllPhysicalProducts()
    ).map(a => a.model.sUID.text)
    const allAirtableProductVariantSKUs = (
      await this.airtableService.getAllProductVariants()
    ).map(a => a.model.sKU)

    return (
      await this.prisma.binding.query.productVariants(
        args,
        info ||
          `{
          id
          sku
          physicalProducts {
              seasonsUID
          }
        }`
      )
    )
      .filter(a => allAirtableProductVariantSKUs.includes(a.sku))
      .filter(a =>
        a.physicalProducts.every(b =>
          allAirtablePhysicalProductsSUIDs.includes(b.seasonsUID)
        )
      )
  }
}
