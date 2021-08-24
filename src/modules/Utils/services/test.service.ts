import { Inject, forwardRef } from "@nestjs/common"
import {
  InventoryStatus,
  PhysicalProductStatus,
  UserPushNotificationInterestType,
} from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { merge } from "lodash"

import {
  CreateTestCustomerInput,
  CreateTestCustomerOutput,
  CreateTestPhysicalProductInput,
  CreateTestProductInput,
  CreateTestProductOutput,
  CreateTestProductVariantInput,
} from "../utils.types.d"
import { UtilsService } from "./utils.service"

export class TestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UtilsService))
    private readonly utils: UtilsService
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
        user: {
          connect: {
            id: customer.user.id,
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

    return reservation
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

  async createTestCustomer(
    input: CreateTestCustomerInput,
    select = {
      id: true,
      detail: {
        select: {
          shippingAddress: { select: { id: true } },
        },
      },
      user: { select: { id: true } },
    } as any
  ): Promise<CreateTestCustomerOutput> {
    const detail = !!input.detail
      ? {
          create: {
            topSizes: input.detail.topSizes,
            waistSizes: input.detail.waistSizes,
            shippingAddress: {
              create: {
                zipCode: "10013",
              },
            },
            phoneOS: input.detail?.phoneOS,
          } as Prisma.CustomerDetailCreateInput,
        }
      : {}

    // If there's a membership on the customer, we create it during the initial
    // call to createCustomer. If there are pauseRequests on it, we create only
    // the first one. We leave any subsequent pauseRequests for later, so the
    // createdAt fields are different
    let membership
    if (!!input.membership) {
      membership = {
        create: {
          subscriptionId: this.utils.randomString(),
          pauseRequests: { create: input.membership.pauseRequests[0] },
        },
      }
    }

    const createdCustomer = await this.prisma.client.customer.create({
      data: {
        status: input.status || "Active",
        user: {
          create: {
            auth0Id: this.utils.randomString(),
            email: this.utils.randomString() + "@seasons.nyc",
            firstName: this.utils.randomString(),
            lastName: this.utils.randomString(),
          },
        },
        detail,
        membership,
      },
      select: {
        id: true,
        detail: { select: { shippingAddress: { select: { id: true } } } },
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    const defaultPushNotificationInterests = [
      "General",
      "Blog",
      "Bag",
      "NewProduct",
    ] as UserPushNotificationInterestType[]

    const pushNotif = await this.prisma.client.userPushNotification.create({
      data: {
        interests: {
          create: defaultPushNotificationInterests.map(type => ({
            type,
            value: "",
            user: { connect: { id: createdCustomer.user.id } },
            status: true,
          })),
        },
        status: true,
      },
    })

    await this.prisma.client.user.update({
      where: { id: createdCustomer.user.id },
      data: {
        pushNotification: {
          connect: { id: pushNotif.id },
        },
      },
    })

    // If there are additional pause requests, create them in order
    if (input.membership?.pauseRequests?.length > 1) {
      for (const pauseRequestCreateInput of input.membership.pauseRequests.slice(
        1
      )) {
        await new Promise(r => setTimeout(r, 2000))
        await this.prisma.client.customer.update({
          where: { id: createdCustomer.id },
          data: {
            membership: {
              update: { pauseRequests: { create: pauseRequestCreateInput } },
            },
          },
        })
        await this.prisma.client.customer.update({
          where: { id: createdCustomer.id },
          data: {
            membership: {
              update: { pauseRequests: { create: pauseRequestCreateInput } },
            },
          },
        })
      }
    }

    const returnedCustomer = await this.prisma.client.customer.findFirst({
      where: { id: createdCustomer.id },
      select,
    })

    const cleanupFunc = async () => {
      await this.prisma.client.customerAdmissionsData.deleteMany({
        where: { id: createdCustomer.id },
      })

      await this.prisma.client.userPushNotificationInterest.deleteMany({
        where: {
          user: { id: createdCustomer.user.id },
        },
      })

      await this.prisma.client.userPushNotification.delete({
        where: { id: pushNotif.id },
      })

      if (!!createdCustomer.detail?.shippingAddress?.id) {
        await this.prisma.client.location.delete({
          where: { id: createdCustomer.detail.shippingAddress.id },
        })
      }
      await this.prisma.client.customer.delete({
        where: { id: createdCustomer.id },
      })
    }
    return { cleanupFunc, customer: returnedCustomer }
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

  private async getUniqueReservationNumber(): Promise<number> {
    let reservationNumber: number
    let foundUnique = false
    while (!foundUnique) {
      reservationNumber = Math.floor(Math.random() * 900000000) + 100000000
      const reservationWithThatNumber = await this.prisma.client.reservation.findUnique(
        {
          where: {
            reservationNumber,
          },
        }
      )
      foundUnique = !reservationWithThatNumber
    }

    return reservationNumber
  }
}
