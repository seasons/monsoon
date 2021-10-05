import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { DateTime } from "luxon"

import { ReservationDropOffAgent } from ".prisma/client"

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

  async returnMultiItems(
    trackingNumber: string,
    productStates: ProductState[],
    droppedOffBy: ReservationDropOffAgent
  ) {
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
      hasReturnedProcessed: true,
      returnProcessedAt: DateTime.local().toISO(),
      returnedPackage: {
        connect: {
          returnedPackage,
        },
      },
      droppedOffBy: droppedOffBy,
      droppedOffAt: DateTime.local().toISO(),
    }

    await this.prisma.client.reservationPhysicalProduct.updateMany({
      where: {
        physicalProduct: {
          seasonsUID: {
            in: productStates.map(a => {
              return a.productUID
            }),
          },
        },
      },
      data: { ...reservationPhysicalProductData },
    })

    const reservations = await this.prisma.client.reservation.findMany({
      where: {
        reservationPhysicalProduct: {
          every: {
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
        reservationPhysicalProduct: {
          select: {
            hasReturnProcessed: true,
          },
        },
      },
    })

    promises.push(
      this.prisma.client.bagItem.deleteMany({
        where: {
          id: {
            in: physicalProducts.map(a => {
              return a.id
            }),
          },
        },
      })
    )

    for (let reservation of reservations) {
      const allProductsReturned = reservation.reservationPhysicalProduct.every(
        a => a.hasReturnProcessed
      )
      const reservationWhere = {
        where: {
          id: reservation.id,
        },
      }
      if (allProductsReturned) {
        return promises.push(
          this.prisma.client.reservation.update({
            ...reservationWhere,
            data: {
              status: "Completed",
            },
          })
        )
      }
      return promises.push(
        this.prisma.client.reservation.update({
          ...reservationWhere,
          data: {
            status: "ReturnPending",
          },
        })
      )
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
  }
}
