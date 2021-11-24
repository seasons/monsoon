import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import {
  Customer,
  Prisma,
  ReservationDropOffAgent,
  ReservationPhysicalProductStatus,
  ShippingCode,
  ShippingMethod,
} from "@prisma/client"
import cuid from "cuid"
import { DateTime } from "luxon"

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
    private readonly utils: UtilsService
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

    const {
      promise: updateReservationPromise,
    } = await this.updateReservationsOnReturn(productStates, customerId)
    promises.push(updateReservationPromise)

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
        status: true,
        reservationPhysicalProducts: {
          select: {
            physicalProductId: true,
          },
        },
      },
    })

    // Status Lost supercedes status Completed in importance
    const reservationsToUpdate = reservations.filter(a => a.status !== "Lost")
    return this.utils.wrapPrismaPromise(
      this.prisma.client.reservation.updateMany({
        where: {
          id: {
            in: reservationsToUpdate.map(a => a.id),
          },
        },
        data: {
          status: "Completed",
        },
      })
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

  async pickItems(
    customerID: string,
    select: Prisma.ReservationPhysicalProductSelect
  ) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          status: "Queued",
        },
        customerId: customerID,
      },
      select: {
        id: true,
        reservationPhysicalProduct: {
          select: {
            id: true,
            physicalProductId: true,
            status: true,
          },
        },
      },
    })

    const promises = []

    for (let bagItem of bagItems) {
      const reservationPhysicalProduct = bagItem.reservationPhysicalProduct

      if (reservationPhysicalProduct.status !== "Queued") {
        throw new Error("Reservation physical product status should be Queued")
      }

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

  async packItems(
    customerID: string,
    select: Prisma.ReservationPhysicalProductSelect
  ) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          status: "Picked",
        },
        customerId: customerID,
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

    const promises = []

    for (let bagItem of bagItems) {
      const reservationPhysicalProduct = bagItem.reservationPhysicalProduct

      if (reservationPhysicalProduct.status !== "Picked") {
        throw new Error("Reservation physical product status should be Picked")
      }

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

  async generateShippingLabels(
    customerID: string,
    select?: Prisma.PackageSelect
  ) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        reservationPhysicalProduct: {
          status: "Packed",
          outboundPackage: {
            is: null,
          },
        },
        customerId: customerID,
      },
      select: {
        id: true,
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
                  connect: [
                    { id: inboundPackageId },
                    { id: outboundPackageId },
                  ],
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
                returnedPackage: {
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

    const [
      outboundPackage,
      inboundPackage,
    ] = await this.prisma.client.$transaction([...packagePromises, ...promises])
    return [outboundPackage, inboundPackage].filter(Boolean)
  }
}
