import { ProductService } from "@app/modules/Product"
import { ReservationService } from "@app/modules/Reservation/services/reservation.service"
import { AirtableBaseService, AirtableUtilsService } from "@modules/Airtable"
import { AirtableService } from "@modules/Airtable/index"
import { EmailDataProvider, EmailService } from "@modules/Email"
import { ImageService } from "@modules/Image/services/image.service"
import { PhysicalProductUtilsService } from "@modules/Product/services/physicalProduct.utils.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { ProductVariantService } from "@modules/Product/services/productVariant.service"
import { ReservationUtilsService } from "@modules/Reservation/services/reservation.utils.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { UtilsService } from "@modules/Utils/index"
import { Customer, ID_Input, InventoryStatus, User } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { sampleSize } from "lodash"

import { ProductCountAndStatusSummary } from "../utils.types"

export class TestUtilsService {
  private defaultProductVariantInfo = `{
    id
    sku
    physicalProducts {
        seasonsUID
    }
  }`
  private defaultProductInfo = `{
    id
    slug
    variants {
      sku
      physicalProducts {
        seasonsUID
      }
    }
  }`
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
      id: await this.prisma.client.customer({ id: newCustomer.id }).user().id(),
    })
    this.airtableService.createOrUpdateAirtableUser(newUser, {})

    return { user: newUser, customer: newCustomer }
  }

  createReservationService() {
    const physProdService = new PhysicalProductUtilsService(
      this.prisma,
      new ProductUtilsService(this.prisma)
    )
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

  createProductService() {
    return new ProductService(
      this.prisma,
      new ImageService(),
      new ProductUtilsService(this.prisma),
      new ProductVariantService(
        this.prisma,
        new PhysicalProductUtilsService(
          this.prisma,
          new ProductUtilsService(this.prisma)
        ),
        this.airtableService
      ),
      new UtilsService(this.prisma)
    )
  }

  async getTestableReservableProductVariants(info?) {
    return await this.getTestableProductVariants(
      {
        where: {
          reservable_gt: 0,
          physicalProducts_some: { inventoryStatus: "Reservable" },
        },
      },
      info,
      "Reservable"
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
      info,
      "Reserved"
    )
  }

  async initializePreReservationCustomerBag(
    productVariantsToReserve: ID_Input[],
    testCustomer,
    includedSaved = true
  ) {
    for (const id of productVariantsToReserve) {
      await this.prisma.client.createBagItem({
        customer: { connect: { id: testCustomer.id } },
        productVariant: { connect: { id } },
        saved: false,
        status: "Added",
      })
      if (includedSaved) {
        await this.prisma.client.createBagItem({
          customer: { connect: { id: testCustomer.id } },
          productVariant: { connect: { id } },
          saved: true,
          status: "Added",
        })
      }
    }
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

  private async createTestableProductVariants({
    inventoryStatus,
    num = 10,
    info,
  }: {
    inventoryStatus: InventoryStatus
    num?: number
    info?
  }) {
    if (num > 100) {
      throw new Error("Can not create more than 100 testable product variants")
    }

    const prodVars = sampleSize(
      await this.getProductVariantsWithAirtableRecords(
        {},
        `{
          id
          sku
          total
          reserved
          nonReservable
          reservable
        }`
      ),
      num
    )

    for (const pv of prodVars) {
      const counts = { reserved: 0, nonReservable: 0, reservable: 0 }
      counts[this.inventoryStatusToPrismaCountField(inventoryStatus)] = pv.total

      // Set counts on prisma, airtable
      await this.prisma.client.updateProductVariant({
        where: { id: pv.id },
        data: counts,
      })
      const correspondingAirtableProdVar = await this.airtableService.getCorrespondingAirtableProductVariant(
        await this.airtableService.getAllProductVariants(),
        pv
      )
      this.airtableService.updateProductVariantCounts(
        correspondingAirtableProdVar.id,
        this.airtableService.prismaToAirtableCounts(counts)
      )

      // Set appropriate inventory status for related physical products on prisma, airtable
      const physicalProducts = await this.prisma.client.physicalProducts({
        where: { productVariant: { sku: pv.sku } },
      })
      await this.prisma.client.updateManyPhysicalProducts({
        where: { id_in: physicalProducts.map(a => a.id) },
        data: { inventoryStatus },
      })
      const allAirtablePhysicalProducts = await this.airtableService.getAllPhysicalProducts()
      await this.airtableService.updatePhysicalProducts(
        physicalProducts
          .map(a =>
            this.airtableService.getCorrespondingAirtablePhysicalProduct(
              allAirtablePhysicalProducts,
              a
            )
          )
          .map(a => a.id),
        [
          {
            "Inventory Status": this.airtableService.prismaToAirtableInventoryStatus(
              inventoryStatus
            ),
          },
        ]
      )
    }

    return await this.prisma.binding.query.productVariants(
      {
        where: { id_in: prodVars.map(a => a.id) },
      },
      info || this.defaultProductVariantInfo
    )
  }

  /**
   * Returns a list of all product variants which
   * a) have corresponding records in airtable
   * b) have physical products that have corresponding records in airtable
   * c) satisfy args
   *
   * If needed, creates 20 such records and returns then
   */
  private async getTestableProductVariants(args, info, inventoryStatus) {
    let prodVarsWithAirtableRecords = await this.getProductVariantsWithAirtableRecords(
      args,
      info
    )

    let res
    if (prodVarsWithAirtableRecords.length === 0 && !!inventoryStatus) {
      res = await this.createTestableProductVariants({
        inventoryStatus,
        num: 20,
        info,
      })
    } else {
      res = await this.prisma.binding.query.productVariants(
        { where: { sku_in: prodVarsWithAirtableRecords.map(a => a.sku) } },
        info || this.defaultProductVariantInfo
      )
    }

    return res
  }

  private async getProductVariantsWithAirtableRecords(args, info) {
    const allAirtablePhysicalProductsSUIDs = (
      await this.airtableService.getAllPhysicalProducts()
    ).map(a => a.model.suid.text)
    const allAirtableProductVariantSKUs = (
      await this.airtableService.getAllProductVariants()
    ).map(a => a.model.sku)

    const _res = (
      await this.prisma.binding.query.productVariants(
        args,
        `{
        sku
        physicalProducts {
          seasonsUID
        }
      }`
      )
    )
      .filter(a => allAirtableProductVariantSKUs.includes(a.sku))
      .filter(a =>
        a.physicalProducts?.every(b =>
          allAirtablePhysicalProductsSUIDs.includes(b.seasonsUID)
        )
      )

    return await this.prisma.binding.query.productVariants(
      { where: { sku_in: _res.map(a => a.sku) } },
      info || this.defaultProductVariantInfo
    )
  }

  private inventoryStatusToPrismaCountField(inventoryStatus: InventoryStatus) {
    switch (inventoryStatus) {
      case "NonReservable":
        return "nonReservable"
      case "Reservable":
        return "reservable"
      case "Reserved":
        return "reserved"
      default:
        throw new Error(`Invalid inventory status ${inventoryStatus}`)
    }
  }
}
