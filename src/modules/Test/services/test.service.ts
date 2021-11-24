import { Inject, forwardRef } from "@nestjs/common"
import { InventoryStatus, PhysicalProductStatus } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import faker from "faker"
import { merge } from "lodash"
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

  async createTestReservation({
    sentPackageTransactionID,
    returnPackageTransactionID,
    select = {},
  }: {
    sentPackageTransactionID: string
    returnPackageTransactionID: string
    select?: Prisma.ReservationSelect
  }) {
    const uniqueReservationNumber = await this.utils.getUniqueReservationNumber()
    const customer = await this.prisma.client.customer.findFirst({
      where: { status: "Active" },
      select: { id: true, user: { select: { id: true } } },
    })
    const toLocation = await this.prisma.client.location.findFirst({
      select: { id: true },
    })
    const products = await this.prisma.client.physicalProduct.findMany({
      where: { inventoryStatus: "Reservable" },
      take: 2,
      select: { seasonsUID: true },
    })
    const productSUIDConnectInput = products.map(a => ({
      seasonsUID: a.seasonsUID,
    }))

    const reservation = await this.prisma.client.reservation.create({
      data: {
        products: {
          connect: productSUIDConnectInput,
        },
        newProducts: {
          connect: productSUIDConnectInput,
        },
        customer: {
          connect: {
            id: customer.id,
          },
        },
        phase: "BusinessToCustomer",
        sentPackage: {
          create: {
            transactionID: sentPackageTransactionID,
            weight: 2,
            items: {
              connect: productSUIDConnectInput,
            },
            shippingLabel: {
              create: {
                image: "",
                trackingNumber: "",
                trackingURL: "",
                name: "UPS",
              },
            },
            fromAddress: {
              connect: {
                slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
              },
            },
            toAddress: {
              connect: { id: toLocation.id },
            },
          },
        },
        returnPackages: {
          create: {
            transactionID: returnPackageTransactionID,
            shippingLabel: {
              create: {
                image: "",
                trackingNumber: "",
                trackingURL: "",
                name: "UPS",
              },
            },
            fromAddress: {
              connect: {
                id: toLocation.id,
              },
            },
            toAddress: {
              connect: {
                slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
              },
            },
          },
        },
        reservationNumber: uniqueReservationNumber,
        lastLocation: {
          connect: {
            slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
          },
        },
        shipped: false,
        status: "Queued",
      },
      select: merge({ id: true }, select),
    })

    const cleanupFunc = async () =>
      this.prisma.client.reservation.delete({ where: { id: reservation.id } })
    return { reservation, cleanupFunc }
  }

  /* 
    Creates a test product according to the constraints passed in. 
    
    Note that much of the data here is fudged. As use cases arise that
    require things to be more fleshed out, we'll need to update this 
    method accordingly
  */
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
