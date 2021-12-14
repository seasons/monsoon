import { EmailService } from "@app/modules/Email/services/email.service"
import { ProductVariantService } from "@app/modules/Product/services/productVariant.service"
import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { InventoryStatus, PhysicalProductStatus } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import {
  Prisma,
  ReservationDropOffAgent,
  ReservationPhysicalProduct,
  ReservationPhysicalProductStatus,
} from "@prisma/client"
import { every, some } from "lodash"
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

type ProcessReturnPhysicalProductWithRPP = ProcessReturnPhysicalProduct & {
  reservationPhysicalProducts: Array<Pick<ReservationPhysicalProduct, "id">>
}

@Injectable()
export class ReservationPhysicalProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantService: ProductVariantService,
    private readonly shippingService: ShippingService,
    private readonly utils: UtilsService,
    private readonly reservationUtils: ReservationUtilsService,
    private readonly email: EmailService
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
        ...ProcessReturnPhysicalProductsSelect,
        // get the customer's most recent rpp for this phys prod also
        reservationPhysicalProducts: {
          select: { id: true },
          orderBy: { createdAt: "desc" },
          take: 1,
          where: { customer: { id: customerId } },
        },
      },
    })

    let promises = []
    const updateRPPPromises = await this.updateReservationPhysicalProductsOnReturn(
      physicalProducts,
      trackingNumber,
      droppedOffBy
    )
    promises.push(...updateRPPPromises)

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
    physicalProductsWithData: ProcessReturnPhysicalProductWithRPP[],
    trackingNumber: string | undefined,
    droppedOffBy: ReservationDropOffAgent
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
    const reservationPhysicalProductData = Prisma.validator<
      Prisma.ReservationPhysicalProductUpdateInput
    >()({
      status: "ReturnProcessed",
      hasReturnProcessed: true,
      returnProcessedAt: DateTime.local().toISO(),
      ...(returnedPackage && {
        inboundPackage: { connect: { id: returnedPackage.id } },
        physicalProduct: {
          update: { packages: { connect: { id: returnedPackage.id } } },
        },
      }),
      droppedOffBy,
      droppedOffAt: DateTime.local().toISO(),
    })

    let promises = []
    for (const physProd of physicalProductsWithData) {
      promises.push(
        this.prisma.client.reservationPhysicalProduct.update({
          where: { id: physProd.reservationPhysicalProducts[0].id },
          data: reservationPhysicalProductData,
        })
      )
    }

    return promises
  }

  async markAsCancelled({ bagItemIds }: { bagItemIds: [string] }) {
    const cancelledBagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIds,
        },
      },
      select: {
        reservationPhysicalProduct: {
          select: {
            id: true,
            status: true,
            physicalProduct: {
              select: {
                id: true,
                inventoryStatus: true,
                productVariant: {
                  select: {
                    id: true,
                    reservable: true,
                    reserved: true,
                    nonReservable: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const promises = []

    const cancelledRPPs = cancelledBagItems.map(
      a => a.reservationPhysicalProduct
    )

    for (let cancelledRPP of cancelledRPPs) {
      const cancelledPhysicalProductNewStatus =
        cancelledRPP.status === "Queued" ? "Reservable" : "NonReservable"
      const cancelledPhysicalProduct = cancelledRPP.physicalProduct
      const cancelledProdVariant = cancelledPhysicalProduct.productVariant

      const productVariantData = this.productVariantService.getCountsForStatusChange(
        {
          productVariant: cancelledProdVariant,
          oldInventoryStatus: cancelledPhysicalProduct.inventoryStatus as InventoryStatus,
          newInventoryStatus: cancelledPhysicalProductNewStatus,
        }
      )
      promises.push(
        this.prisma.client.physicalProduct.update({
          where: {
            id: cancelledPhysicalProduct.id,
          },
          data: {
            inventoryStatus: cancelledPhysicalProductNewStatus,
            productVariant: {
              update: {
                ...productVariantData,
              },
            },
          },
        })
      )
    }

    promises.push(
      this.prisma.client.bagItem.deleteMany({
        where: {
          id: {
            in: bagItemIds,
          },
        },
      })
    )

    promises.push(
      this.prisma.client.reservationPhysicalProduct.updateMany({
        where: {
          id: {
            in: cancelledRPPs.map(a => a.id),
          },
        },
        data: {
          status: "Cancelled",
          cancelledAt: new Date(),
        },
      })
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
    physicalProductsWithData: ProcessReturnPhysicalProductWithRPP[]
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
    await this.reservationUtils.updateOutboundResProcessingStats()

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
      !every(bagItems, b =>
        ["Queued", "Picked"].includes(b.reservationPhysicalProduct?.status)
      )
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
    options = { includeLabelForPickups: false },
  }: {
    bagItemIds?: string[]
    options?: {
      includeLabelForPickups?: boolean
    }
    select?: Prisma.PackageSelect
  }) {
    const bagItems = await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: bagItemIds,
        },
        reservationPhysicalProduct: {
          status: "Packed",
        },
      },
      select: {
        id: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
              },
            },
          },
        },
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
            outboundPackage: {
              select: {
                id: true,
                transactionID: true,
                shippingLabel: {
                  select: {
                    id: true,
                    image: true,
                    trackingNumber: true,
                    trackingURL: true,
                  },
                },
              },
            },
            potentialInboundPackage: {
              select: {
                id: true,
                transactionID: true,
                shippingLabel: {
                  select: {
                    id: true,
                    image: true,
                    trackingNumber: true,
                    trackingURL: true,
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
    const promises = await this.removePreviousShippingLabels(bagItems)

    const {
      promises: packagePromises,
      inboundPackageId,
      outboundPackageId,
      shippingCode,
    } = await this.shippingService.createPackages({
      bagItems,
      customer: { id: customerID },
      includeLabelForPickups: options?.includeLabelForPickups,
      select,
    })

    for (let bagItem of bagItems) {
      promises.push(
        this.prisma.client.reservationPhysicalProduct.update({
          where: {
            id: bagItem.reservationPhysicalProduct.id,
          },
          data: {
            ...(outboundPackageId && {
              outboundPackage: {
                connect: {
                  id: outboundPackageId,
                },
              },
            }),
            potentialInboundPackage: {
              connect: {
                id: inboundPackageId,
              },
            },
            physicalProduct: {
              update: {
                packages: {
                  connect: (() => {
                    if (outboundPackageId) {
                      return [{ id: outboundPackageId }]
                    }
                    return []
                  })(),
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

    await this.email.sendReservationProcessedEmail({
      user,
      reservation: {
        id: bagItem.reservationPhysicalProduct.reservation.id,
      },
      outboundPackage,
      shippingCode,
    })

    if (outboundPackageId === null) {
      return [null, inboundPackage]
    }

    return [outboundPackage, inboundPackage]
  }

  private async removePreviousShippingLabels(bagItems) {
    const anyBagItemsWithPotentialInboundPackage = bagItems.some(
      b => !!b.reservationPhysicalProduct.potentialInboundPackage
    )
    const promises = []
    // Void labels for any bagItems that have a potential inbound package
    if (anyBagItemsWithPotentialInboundPackage) {
      const transactionIds = new Set<string>()
      const packageIds = new Set<string>()

      for (let bagItem of bagItems) {
        const potentialInboundPackage =
          bagItem.reservationPhysicalProduct.potentialInboundPackage
        const outboundPackage =
          bagItem.reservationPhysicalProduct.outboundPackage

        if (potentialInboundPackage) {
          packageIds.add(potentialInboundPackage.id)
          transactionIds.add(potentialInboundPackage.transactionID)
        }

        if (outboundPackage) {
          packageIds.add(outboundPackage.id)
          transactionIds.add(outboundPackage.transactionID)
        }
      }

      for (let transactionID of transactionIds) {
        await this.shippingService.voidLabel({
          transactionID,
        })
      }

      for (let packageId of packageIds) {
        promises.push(
          this.prisma.client.package.delete({ where: { id: packageId } })
        )
      }
    }

    return promises
  }

  async markAsPickedUp(bagItemIds) {
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
