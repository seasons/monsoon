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

  async returnMultiItems({
    productStates,
    droppedOffBy,
    trackingNumber,
  }: {
    productStates: ProductState[]
    droppedOffBy: ReservationDropOffAgent
    trackingNumber?: string
  }) {
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
        shippingLabelId: trackingNumber,
      },
    })

    let promises = []

    const reservationPhysicalProductData = {
      status: <ReservationPhysicalProductStatus>"ReturnProcessed",
      hasReturnProcessed: true,
      returnProcessedAt: DateTime.local().toISO(),
      ...(returnedPackage && {
        inboundPackage: {
          connect: {
            returnedPackage,
          },
        },
      }),
      droppedOffBy: { set: droppedOffBy },
      droppedOffAt: DateTime.local().toISO(),
    }
    await this.prisma.client.reservationPhysicalProduct.updateMany({
      where: {
        physicalProductId: {
          in: physicalProducts.map(a => {
            return a.id
          }),
        },
      },
      data: { ...reservationPhysicalProductData },
    })

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
          },
        },
      },
      select: {
        id: true,
        reservationPhysicalProducts: {
          select: {
            hasReturnProcessed: true,
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
        },
      })
    )

    for (let reservation of reservations) {
      const allProductsReturned = reservation.reservationPhysicalProducts.every(
        a => a.hasReturnProcessed
      )

      if (allProductsReturned) {
        promises.push(
          this.prisma.client.reservation.update({
            where: {
              id: reservation.id,
            },
            data: {
              status: "Completed",
            },
          })
        )
      }
    }

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
    const reservationPhysicalProducts = this.prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          status: "Packed",
          reservation: {
            customer: {
              id: customer.id,
            },
          },
        },
        select: {
          physicalProduct: {
            select: {
              id: true,
              productVariant: {
                select: {},
              },
            },
          },
        },
      }
    )

    const promises = []
  }
}
