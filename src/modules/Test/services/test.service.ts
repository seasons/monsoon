import { Inject, forwardRef } from "@nestjs/common"
import { InventoryStatus, PhysicalProductStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import faker from "faker"
import { merge } from "lodash"
import { DateTime } from "luxon"
import slugify from "slugify"

import { TimeUtilsService } from "../../Utils/services/time.service"
import { UtilsService } from "../../Utils/services/utils.service"
import {
  CreateTestPhysicalProductInput,
  CreateTestProductInput,
  CreateTestProductOutput,
  CreateTestProductVariantInput,
} from "../../Utils/utils.types"

export const UPS_GROUND_FEE = 1000

export class TestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UtilsService))
    private readonly utils: UtilsService,
    private readonly timeUtils: TimeUtilsService
  ) {}

  async createTestProduct(
    { variants, type = "Top" }: CreateTestProductInput,
    info = `{id}`
  ): Promise<CreateTestProductOutput> {
    const color = await this.prisma.client.color.create({
      data: {
        slug: this.utils.randomString(),
        name: this.utils.randomString(),
        colorCode: this.utils.randomString(),
        hexCode: this.utils.randomString(),
      },
    })

    const brand = await this.prisma.client.brand.create({
      data: {
        slug: this.utils.randomString(),
        brandCode: this.utils.randomString(),
        name: "",
        tier: "Tier0",
        isPrimaryBrand: true,
        published: true,
        featured: true,
      },
    })

    const category = await this.prisma.client.category.create({
      data: {
        slug: this.utils.randomString(),
        name: this.utils.randomString(),
      },
    })

    const data = {
      type,
      slug: this.utils.randomString(),
      brand: { connect: { id: brand.id } },
      category: { connect: { id: category.id } },
      color: { connect: { id: color.id } },
      images: {},
      variants: {
        create: variants.map((v: CreateTestProductVariantInput) => {
          return {
            color: {
              connect: {
                id: color.id,
              },
            },
            total: v.physicalProducts.length,
            reservable: this.getInventoryStatusCount(v, "Reservable"),
            reserved: this.getInventoryStatusCount(v, "Reserved"),
            nonReservable: this.getInventoryStatusCount(v, "NonReservable"),
            offloaded: this.getInventoryStatusCount(v, "Offloaded"),
            stored: this.getInventoryStatusCount(v, "Stored"),
            displayShort: v.displayShort ?? "M",
            physicalProducts: {
              create: v.physicalProducts.map(
                (pp: CreateTestPhysicalProductInput) => ({
                  seasonsUID: this.utils.randomString(),
                  inventoryStatus: pp.inventoryStatus,
                  productStatus: "New" as PhysicalProductStatus,
                  sequenceNumber: 0,
                })
              ),
            },
          }
        }),
      },
      name: "",
    } as Prisma.ProductCreateInput

    const product = await this.prisma.client.product.create({
      data,
    })

    const cleanupFunc = async () => {
      await this.prisma.client.product.delete({ where: { id: product.id } })
      await this.prisma.client.color.delete({ where: { id: color.id } })
      await this.prisma.client.brand.delete({ where: { id: brand.id } })
      await this.prisma.client.category.delete({ where: { id: category.id } })
    }

    return {
      cleanupFunc,
      product,
    }
  }

  async createTestCustomer({
    create = {},
    select = { id: true },
  }: {
    create?: Partial<Prisma.CustomerCreateInput>
    select?: Prisma.CustomerSelect
  } = {}): Promise<{ cleanupFunc: () => void; customer: any }> {
    const chargebeeSubscriptionId = this.utils.randomString()
    const firstName = faker.name.firstName()
    const lastName = `${faker.name.lastName()} Tester`
    const fullName = `${firstName} ${lastName}`
    const slug = slugify(fullName)

    const defaultCreateData = {
      status: "Active",
      user: {
        create: {
          auth0Id: this.utils.randomString(),
          email: slug + "@seasons.nyc",
          firstName,
          lastName,
        },
      },
      detail: {
        create: {
          shippingAddress: {
            create: {
              slug,
              address1: "55 Washington St Ste 736",
              city: "Brooklyn",
              state: "NY",
              zipCode: "11201",
            },
          },
        },
      },
      membership: {
        create: {
          purchaseCredits: 0,
          subscriptionId: chargebeeSubscriptionId,
          plan: { connect: { planID: "access-monthly" } },
          creditBalance: 0,
          rentalInvoices: {
            create: {
              billingStartAt: this.timeUtils.xDaysAgoISOString(30),
              billingEndAt: new Date(),
            },
          },
          subscription: {
            create: {
              planID: "access-monthly",
              subscriptionId: chargebeeSubscriptionId,
              currentTermStart: this.timeUtils.xDaysAgoISOString(1),
              currentTermEnd: this.timeUtils.xDaysFromNowISOString(1),
              nextBillingAt: this.timeUtils.xDaysFromNowISOString(1),
              status: "Active",
              planPrice: 2000,
            },
          },
        },
      },
    }
    const createData = merge(defaultCreateData, create)
    const customer = await this.prisma.client.customer.create({
      data: createData,
      select: merge(select, { id: true }),
    })
    const cleanupFunc = async () =>
      this.prisma.client.customer.delete({ where: { id: customer.id } })
    return { cleanupFunc, customer }
  }

  expectTimeToEqual = (testTime: Date, expectedTime: Date | null) => {
    if (!expectedTime) {
      expect(testTime).toBe(expectedTime)
    }
    const timeLuxon = DateTime.fromJSDate(testTime)
    const expectedValueLuxon = DateTime.fromJSDate(expectedTime)
    const sameDay = timeLuxon.hasSame(expectedValueLuxon, "day")
    const sameMonth = timeLuxon.hasSame(expectedValueLuxon, "month")
    const sameYear = timeLuxon.hasSame(expectedValueLuxon, "year")
    expect(sameDay).toBe(true)
    expect(sameMonth).toBe(true)
    expect(sameYear).toBe(true)
  }

  // returns the number of physical products with the given inventory status
  // to create on this product variant
  private getInventoryStatusCount(
    input: CreateTestProductVariantInput,
    inventoryStatus: InventoryStatus
  ) {
    return input.physicalProducts.filter(
      pp => pp.inventoryStatus === inventoryStatus
    ).length
  }
}
