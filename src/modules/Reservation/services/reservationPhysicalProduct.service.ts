import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import {
  Customer,
  Prisma,
  ReservationDropOffAgent,
  ReservationPhysicalProductStatus,
} from "@prisma/client"
import { DateTime } from "luxon"

interface ProductState {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

@Injectable()
export class ReservationPhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService
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
      select: {
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
      },
    })

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

    let promises = []

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

    promises.push(
      this.prisma.client.reservationPhysicalProduct.updateMany({
        where: {
          physicalProductId: {
            in: physicalProducts.map(a => {
              return a.id
            }),
          },
          bagItem: {
            customerId: customerId,
          },
        },
        data: { ...reservationPhysicalProductData },
      })
    )

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

    const reservationWithStatusDelivered = reservations.filter(
      a => a.status !== "Lost"
    )

    promises.push(
      this.prisma.client.reservation.updateMany({
        where: {
          id: {
            in: reservationWithStatusDelivered.map(a => a.id),
          },
        },
        data: {
          status: "Completed",
        },
      })
    )

    for (let state of productStates) {
      const physicalProduct = physicalProducts.find(
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

    const results = await this.prisma.client.$transaction(promises)
    return !!results
  }

  async pickItems(
    bagItemIDs: string[],
    select: Prisma.ReservationPhysicalProductSelect
  ) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIDs,
        },
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
    bagItemIDs: string[],
    select: Prisma.ReservationPhysicalProductSelect
  ) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIDs,
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

  async printShippingLabel(customer: Pick<Customer, "id">) {
    // Todo: implement
  }
}
