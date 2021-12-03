import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import {
  Prisma,
  ReservationDropOffAgent,
  ReservationPhysicalProductStatus,
} from "@prisma/client"
import { every, set, some } from "lodash"
import { DateTime } from "luxon"

import { ReservationUtilsService } from "../../Utils/services/reservation.utils.service"

interface ProductState {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

const ProcessReturnPhysicalProductsSelect = Prisma.validator<
  Prisma.PhysicalProductSelect
>()({
  id: true,
  seasonsUID: true,
  inventoryStatus: true,
  productVariant: {
    select: {
      id: true,
      sku: true,
      reserved: true,
      reservable: true,
      nonReservable: true,
      product: true,
    },
  },
})
const ProcessReturnPhysicalProductFindManyArgs = Prisma.validator<
  Prisma.PhysicalProductFindManyArgs
>()({ select: ProcessReturnPhysicalProductsSelect })

type ProcessReturnPhysicalProduct = Prisma.PhysicalProductGetPayload<
  typeof ProcessReturnPhysicalProductFindManyArgs
>

@Injectable()
export class ReservationPhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly shippingService: ShippingService,
    private readonly utils: UtilsService,
    private readonly reservationUtils: ReservationUtilsService
  ) {}

  /*
    Set data on reservation physical products
    Delete bag items
    Update reservation statuses

  */
  async processReturn({
    productStates,
    droppedOffBy,
    trackingNumber,
    customerId,
  }: {
    productStates: ProductState[]
    droppedOffBy: ReservationDropOffAgent
    trackingNumber?: string
    customerId: string
  }) {
    if (droppedOffBy === "UPS" && !trackingNumber) {
      throw new Error(
        `Must specify return package tracking number when processing reservation`
      )
    }

    const physicalProducts = await this.prisma.client.physicalProduct.findMany({
      where: {
        seasonsUID: {
          in: productStates.map(p => p.productUID),
        },
      },
      select: ProcessReturnPhysicalProductsSelect,
    })

    let promises = []
    const {
      promise: updateReservationPhysicalProductsPromise,
    } = await this.updateReservationPhysicalProductsOnReturn(
      physicalProducts,
      trackingNumber,
      droppedOffBy,
      customerId
    )
    promises.push(updateReservationPhysicalProductsPromise)

    promises.push(
      this.prisma.client.bagItem.deleteMany({
        where: {
          physicalProductId: {
            in: physicalProducts.map(a => {
              return a.id
            }),
          },
          customerId: customerId,
        },
      })
    )

    const updateReservationPromises = await this.updateReservationsOnReturn(
      productStates,
      customerId
    )
    promises.push(...updateReservationPromises)

    const updateProductPromises = await this.updateProductsOnReturn(
      productStates,
      physicalProducts
    )
    promises.push(...updateProductPromises)

    const results = await this.prisma.client.$transaction(promises)
    return !!results
  }

  private async updateReservationPhysicalProductsOnReturn(
    physicalProductsWithData: ProcessReturnPhysicalProduct[],
    trackingNumber: string | undefined,
    droppedOffBy: ReservationDropOffAgent,
    customerId: string
  ) {
    const returnedPackage = await this.prisma.client.package.findFirst({
      where: {
        shippingLabel: {
          trackingNumber,
        },
      },
      select: {
        id: true,
      },
    })
    const reservationPhysicalProductData = {
      status: <ReservationPhysicalProductStatus>"ReturnProcessed",
      hasReturnProcessed: true,
      returnProcessedAt: DateTime.local().toISO(),
      ...(returnedPackage && {
        inboundPackageId: returnedPackage.id,
      }),
      droppedOffBy,
      droppedOffAt: DateTime.local().toISO(),
    }

    const promise = this.prisma.client.reservationPhysicalProduct.updateMany({
      where: {
        physicalProductId: {
          in: physicalProductsWithData.map(a => {
            return a.id
          }),
        },
        bagItem: {
          customerId: customerId,
        },
      },
      data: { ...reservationPhysicalProductData },
    })

    return this.utils.wrapPrismaPromise(promise)
  }

  async markAsFound({
    rppId,
    status,
  }: {
    rppId: string
    status: "DeliveredToCustomer" | "DeliveredToBusiness"
  }) {
    const promises = []

    const rppWithData = await this.prisma.client.reservationPhysicalProduct.findUnique(
      {
        where: {
          id: rppId,
        },
        select: {
          physicalProduct: {
            select: {
              id: true,
              productVariant: {
                select: {
                  id: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
            },
          },
          reservation: {
            select: {
              id: true,
              reservationPhysicalProducts: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      }
    )

    promises.push(
      this.prisma.client.bagItem.create({
        data: {
          saved: false,
          status: "Reserved",
          reservationPhysicalProduct: {
            connect: {
              id: rppId,
            },
          },
          physicalProduct: {
            connect: {
              id: rppWithData.physicalProduct.id,
            },
          },
          productVariant: {
            connect: {
              id: rppWithData.physicalProduct.productVariant.id,
            },
          },
          customer: {
            connect: {
              id: rppWithData.customer.id,
            },
          },
        },
      })
    )

    const rppUpdateData: Prisma.ReservationPhysicalProductUpdateInput = {
      status,
      foundAt: new Date().toISOString(),
      hasBeenFound: true,
      foundInPhase:
        status === "DeliveredToCustomer"
          ? "BusinessToCustomer"
          : "CustomerToBusiness",
    }
    if (status === "DeliveredToBusiness") {
      rppUpdateData.deliveredToBusinessAt = new Date().toISOString()
      rppUpdateData.hasBeenDeliveredToBusiness = true
    } else {
      rppUpdateData.hasBeenDeliveredToCustomer = true
    }

    promises.push(
      this.prisma.client.reservationPhysicalProduct.update({
        where: {
          id: rppId,
        },
        data: rppUpdateData,
      })
    )

    promises.push(
      await this.reservationUtils.updateReservationOnChange(
        [rppWithData.reservation.id],
        { rppId: status }
      )
    )

    await this.prisma.client.$transaction(promises)

    return true
  }

  private async updateReservationsOnReturn(
    productStates: ProductState[],
    customerId: string
  ) {
    const reservations = await this.prisma.client.reservation.findMany({
      where: {
        reservationPhysicalProducts: {
          some: {
            physicalProduct: {
              seasonsUID: {
                in: productStates.map(a => {
                  return a.productUID
                }),
              },
            },
            bagItem: {
              customerId: customerId,
            },
          },
        },
      },
      select: {
        id: true,
      },
    })

    const resPhysProds = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          physicalProduct: {
            seasonsUID: {
              in: productStates.map(a => a.productUID),
            },
          },
          bagItem: {
            customerId,
          },
        },
        select: {
          id: true,
        },
      }
    )
    const rppStatusesAfterChange = {}
    resPhysProds.forEach(
      a => (rppStatusesAfterChange[a.id] = "ReturnProcessed")
    )

    return await this.reservationUtils.updateReservationOnChange(
      reservations.map(a => a.id),
      rppStatusesAfterChange
    )
  }

  private async updateProductsOnReturn(
    productStates: ProductState[],
    physicalProductsWithData: ProcessReturnPhysicalProduct[]
  ) {
    let promises = []
    for (let state of productStates) {
      const physicalProduct = physicalProductsWithData.find(
        a => a.seasonsUID === state.productUID
      )
      const productVariant = physicalProduct.productVariant as any
      const product = productVariant.product

      const inventoryStatus: InventoryStatus =
        product.status === "Stored" ? "Stored" : "NonReservable"

      const updateData = {
        productStatus: state.productStatus,
        inventoryStatus,
      }

      const productVariantData = this.productVariantService.getCountsForStatusChange(
        {
          productVariant,
          oldInventoryStatus: physicalProduct.inventoryStatus as InventoryStatus,
          newInventoryStatus: updateData.inventoryStatus as InventoryStatus,
        }
      )

      promises.push(
        this.prisma.client.product.update({
          where: {
            id: product.id,
          },
          data: {
            variants: {
              update: {
                where: {
                  id: productVariant.id,
                },
                data: {
                  ...productVariantData,
                  physicalProducts: {
                    update: {
                      where: {
                        id: physicalProduct.id,
                      },
                      data: {
                        ...updateData,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      )
    }

    return promises
  }

  async pickItems({
    bagItemIds,
    select,
  }: {
    bagItemIds: string[]
    select?: Prisma.ReservationPhysicalProductSelect
  }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIds,
        },
      },
      select: {
        id: true,
        reservationPhysicalProduct: {
          select: {
            id: true,
            physicalProductId: true,
            status: true,
            isOnHold: true,
          },
        },
      },
    })

    if (
      !every(bagItems, b => b.reservationPhysicalProduct?.status === "Queued")
    ) {
      throw new Error(
        "All reservation physical product statuses should be set to Queued"
      )
    }

    if (some(bagItems, b => b.reservationPhysicalProduct?.isOnHold)) {
      const bagItemsWithOnHoldStatus = bagItems.filter(
        b => b.reservationPhysicalProduct.isOnHold
      )
      throw new Error(
        `The following bagItems are on hold: ${bagItemsWithOnHoldStatus
          .map(b => b.id)
          .join(", ")}`
      )
    }

    const promises = []

    for (let bagItem of bagItems) {
      const reservationPhysicalProduct = bagItem.reservationPhysicalProduct

      promises.push(
        this.prisma.client.reservationPhysicalProduct.update({
          where: {
            id: reservationPhysicalProduct.id,
          },
          data: {
            status: "Picked",
            pickedAt: new Date(),
            physicalProduct: {
              update: {
                warehouseLocation: {
                  disconnect: true,
                },
              },
            },
          },
          select,
        })
      )
    }

    const results = await this.prisma.client.$transaction(promises)
    return results
  }

  async packItems({
    bagItemIds,
    select,
  }: {
    bagItemIds: string[]
    select?: Prisma.ReservationPhysicalProductSelect
  }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIds,
        },
      },
      select: {
        id: true,
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
            isOnHold: true,
          },
        },
      },
    })

    if (
      !every(bagItems, b => b.reservationPhysicalProduct?.status === "Picked")
    ) {
      throw new Error(
        "All reservation physical product statuses should be set to Picked"
      )
    }

    if (some(bagItems, b => b.reservationPhysicalProduct?.isOnHold)) {
      const bagItemsWithOnHoldStatus = bagItems.filter(
        b => b.reservationPhysicalProduct.isOnHold
      )
      throw new Error(
        `The following bagItems are on hold: ${bagItemsWithOnHoldStatus
          .map(b => b.id)
          .join(", ")}`
      )
    }

    const promises = []

    for (let bagItem of bagItems) {
      const reservationPhysicalProduct = bagItem.reservationPhysicalProduct

      promises.push(
        this.prisma.client.reservationPhysicalProduct.update({
          where: {
            id: reservationPhysicalProduct.id,
          },
          data: {
            status: "Packed",
            packedAt: new Date(),
          },
          select,
        })
      )
    }

    const results = await this.prisma.client.$transaction(promises)
    return results
  }

  async generateShippingLabels({
    bagItemIds,
    select,
  }: {
    bagItemIds?: string[]
    select?: Prisma.PackageSelect
  }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIds,
        },
        reservationPhysicalProduct: {
          status: "Packed",
          outboundPackage: {
            is: null,
          },
        },
      },
      select: {
        id: true,
        customerId: true,
        reservationPhysicalProduct: {
          select: {
            id: true,
            reservation: {
              select: {
                id: true,
                shippingMethod: true,
              },
            },
            physicalProduct: {
              select: {
                id: true,
                productVariant: {
                  select: {
                    id: true,
                    weight: true,
                    product: {
                      select: {
                        id: true,
                        wholesalePrice: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (bagItems.length === 0) {
      throw new Error("No bag items need labels")
    }

    const customerID = bagItems?.[0].customerId

    const {
      promises: packagePromises,
      inboundPackageId,
      outboundPackageId,
    } = await this.shippingService.createPackages({
      bagItems,
      customer: { id: customerID },
      select,
    })

    const promises = []

    for (let bagItem of bagItems) {
      promises.push(
        this.prisma.client.reservationPhysicalProduct.update({
          where: {
            id: bagItem.reservationPhysicalProduct.id,
          },
          data: {
            inboundPackage: {
              connect: {
                id: inboundPackageId,
              },
            },
            ...(outboundPackageId && {
              outboundPackage: {
                connect: {
                  id: outboundPackageId,
                },
              },
            }),
            physicalProduct: {
              update: {
                packages: {
                  connect: (() => {
                    if (outboundPackageId) {
                      return [
                        { id: inboundPackageId },
                        { id: outboundPackageId },
                      ]
                    }
                    return [{ id: inboundPackageId }]
                  })(),
                },
              },
            },
            reservation: {
              update: {
                ...(outboundPackageId && {
                  sentPackage: {
                    connect: {
                      id: outboundPackageId,
                    },
                  },
                }),
                returnPackages: {
                  connect: {
                    id: inboundPackageId,
                  },
                },
              },
            },
          },
        })
      )
    }

    const { outboundPackagePromise, inboundPackagePromise } = packagePromises

    const filteredPromises = [
      inboundPackagePromise,
      outboundPackagePromise,
      ...promises,
    ].filter(Boolean)

    const result = await this.prisma.client.$transaction(filteredPromises)
    const [inboundPackage, outboundPackage] = result

    if (outboundPackageId === null) {
      return [null, inboundPackage]
    }

    return [outboundPackage, inboundPackage]
  }

  async markNotReturned({ rppId }) {
    const rppWithData = await this.prisma.client.reservationPhysicalProduct.findUnique(
      {
        where: {
          id: rppId,
        },
        select: {
          inboundPackage: true,
        },
      }
    )

    const existingPackage = rppWithData.inboundPackage

    const updateData: Prisma.ReservationPhysicalProductUpdateInput = {
      status: "AtHome",
      hasBeenScannedOnInbound: false,
      scannedOnInboundAt: null,
      hasBeenDeliveredToBusiness: false,
      deliveredToBusinessAt: null,
    }

    if (existingPackage) {
      set(updateData, "inboundPackage.disconnect", true)
      set(updateData, "physicalProduct.update.packages.disconnect", {
        id: existingPackage.id,
      })
    }

    return await this.prisma.client.reservationPhysicalProduct.update({
      where: {
        id: rppId,
      },
      data: updateData,
      select: {
        id: true,
      },
    })
  }

  async markAsPickedUp({ bagItemIds }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIds,
        },
      },
      select: {
        id: true,
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (
      !every(bagItems, b => b.reservationPhysicalProduct?.status === "Packed")
    ) {
      throw new Error(
        "All reservation physical product statuses should be set to Packed"
      )
    }

    const reservationPhysicalProductIds = bagItems.map(
      item => item.reservationPhysicalProduct.id
    )

    await this.generateShippingLabels({ bagItemIds })

    await this.prisma.client.reservationPhysicalProduct.updateMany({
      where: {
        id: { in: reservationPhysicalProductIds },
      },
      data: {
        hasBeenDeliveredToCustomer: true,
        deliveredToCustomerAt: new Date().toISOString(),
        status: "DeliveredToCustomer",
      },
    })
    return true
  }
}
