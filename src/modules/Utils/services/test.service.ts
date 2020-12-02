import {
  CustomerDetailCreateInput,
  InventoryStatus,
  PhysicalProductStatus,
  ProductCreateInput,
  SizeCreateOneInput,
  UserPushNotificationInterestType,
} from "@app/prisma"
import { PrismaService } from "@prisma/prisma.service"

import {
  CreateTestCustomerInput,
  CreateTestCustomerOutput,
  CreateTestPhysicalProductInput,
  CreateTestProductInput,
  CreateTestProductOutput,
  CreateTestProductVariantInput,
} from "../utils.types"
import { UtilsService } from "./utils.service"

export class TestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

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
    const color = await this.prisma.client.createColor({
      slug: this.utils.randomString(),
      name: this.utils.randomString(),
      colorCode: this.utils.randomString(),
      hexCode: this.utils.randomString(),
    })
    const brand = await this.prisma.client.createBrand({
      slug: this.utils.randomString(),
      brandCode: this.utils.randomString(),
      name: "",
      tier: "Tier0",
    })
    const category = await this.prisma.client.createCategory({
      slug: this.utils.randomString(),
      name: this.utils.randomString(),
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
          const internalSize = !!v.internalSize
            ? {
                create: {
                  slug: this.utils.randomString(),
                  productType: type,
                  ...(type === "Top"
                    ? {
                        top: {
                          create: { letter: v.internalSize?.top?.letter },
                        },
                      }
                    : {}),
                  ...(type === "Bottom" ? {} : {}),
                  display: v.internalSize.display,
                } as SizeCreateOneInput,
              }
            : {}

          return {
            color: {
              connect: {
                id: color.id,
              },
            },
            productID: this.utils.randomString(),
            total: v.physicalProducts.length,
            reservable: this.getInventoryStatusCount(v, "Reservable"),
            reserved: this.getInventoryStatusCount(v, "Reserved"),
            nonReservable: this.getInventoryStatusCount(v, "NonReservable"),
            offloaded: this.getInventoryStatusCount(v, "Offloaded"),
            stored: this.getInventoryStatusCount(v, "Stored"),
            internalSize,
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
    } as ProductCreateInput

    const product = await this.prisma.binding.mutation.createProduct(
      { data },
      info
    )

    const cleanupFunc = async () => {
      await this.prisma.client.deleteProduct({ id: product.id })
      await this.prisma.client.deleteColor({ id: color.id })
      await this.prisma.client.deleteBrand({ id: brand.id })
      await this.prisma.client.deleteCategory({ id: category.id })
    }

    return {
      cleanupFunc,
      product,
    }
  }

  async createTestCustomer(
    input: CreateTestCustomerInput,
    info = `{
      id
      user {
        id
      }
    }`
  ): Promise<CreateTestCustomerOutput> {
    const detail = !!input.detail
      ? {
          create: {
            topSizes: { set: input.detail.topSizes || [] },
            waistSizes: { set: input.detail.waistSizes || [] },
            shippingAddress: {
              create: {
                zipCode: "10013",
              },
            },
            phoneOS: input.detail?.phoneOS,
          } as CustomerDetailCreateInput,
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

    let customer = await this.prisma.binding.mutation.createCustomer(
      {
        data: {
          status: input.status || "Active",
          user: {
            create: {
              auth0Id: this.utils.randomString(),
              email: input.email || this.utils.randomString(),
              firstName: this.utils.randomString(),
              lastName: this.utils.randomString(),
            },
          },
          detail,
          membership,
        },
      },
      `{
        id
        user {
          id
        }
      }`
    )

    const defaultPushNotificationInterests = [
      "General",
      "Blog",
      "Bag",
      "NewProduct",
    ] as UserPushNotificationInterestType[]

    const pushNotif = await this.prisma.client.createUserPushNotification({
      interests: {
        create: defaultPushNotificationInterests.map(type => ({
          type,
          value: "",
          user: { connect: { id: customer.user.id } },
          status: true,
        })),
      },
      status: true,
    })

    await this.prisma.client.updateUser({
      where: { id: customer.user.id },
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
        await this.prisma.client.updateCustomer({
          where: { id: customer.id },
          data: {
            membership: {
              update: { pauseRequests: { create: pauseRequestCreateInput } },
            },
          },
        })
      }
    }

    customer = await this.prisma.binding.query.customer(
      { where: { id: customer.id } },
      info
    )

    const cleanupFunc = async () => {
      await this.prisma.client.deleteManyUserPushNotificationInterests({
        user: { id: customer.user.id },
      })
      await this.prisma.client.deleteUserPushNotification({ id: pushNotif.id })
      await this.prisma.client.deleteCustomer({ id: customer.id })
    }
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
