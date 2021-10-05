import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { ReservationService } from ".."

interface ProductState {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

@Injectable()
export class ReservationPhysicalProductService {
  constructor(
    private readonly reservation: ReservationService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService
  ) {}

  async returnMultiItem(
    trackingNumber: string,
    productStates: ProductState[],
    droppedOff: string
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
        returnedProducts: true,
        reservationPhysicalProduct: true,
      },
    })

    this.prisma.client.reservationPhysicalProduct.updateMany({
      where: {
        physicalProduct: {
          seasonsUID: {
            in: productStates.map(a => {
              return a.productUID
            }),
          },
        },
      },
      data: {},
    })
    for (let state of productStates) {
      if (state.returned) {
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
    }
  }
}
