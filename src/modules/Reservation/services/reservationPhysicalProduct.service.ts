import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import {
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

    // This query is incorrect. Should check for where: {label: {trackingNumber}}
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
            // Does this work?
            returnedPackage,
          },
        },
      }),
      // Don't need a set here
      droppedOffBy: { set: droppedOffBy },
      droppedOffAt: DateTime.local().toISO(),
    }
    // Should be in the promise. See comment on line 134 for how to do that.
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

    // This needs to be scoped to the relevant customer, or it will
    // also update reservations for other customers who reserved the same product
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
      // to be safe, i'd scope this to the customer as well
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
      // Should be hasReturnProcessed || hasBeenLost || hasBeenBought
      // Filter out ones that are getting returned now and check only ones
      // that aren't in the current payload. That way, we can keep everything in one transaction
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

  async pickItems(itemIDs: string[]) {
    const reservationPhysicalProducts = await this.prisma.client.reservationPhysicalProduct.findMany(
      {
        where: {
          id: {
            in: itemIDs,
          },
        },
        select: {
          id: true,
          physicalProductId: true,
          physicalProduct: {
            select: {
              id: true,
            },
          },
        },
      }
    )
  }
}
