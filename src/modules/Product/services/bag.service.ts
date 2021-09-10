import { Customer } from "@app/decorators"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { BagItem, BagItemStatus, InventoryStatus, Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"

import { ReservationService } from "../../Reservation/services/reservation.service"
import { ProductVariantService } from "../services/productVariant.service"

@Injectable()
export class BagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationService: ReservationService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService,
    private readonly error: ErrorService,
    private readonly statements: StatementsService
  ) {}

  async addToBag(
    itemId,
    customer,
    select: Prisma.BagItemSelect
  ): Promise<Partial<BagItem>> {
    const custWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        membership: { select: { plan: { select: { itemCount: true } } } },
        bagItems: {
          select: {
            id: true,
            productVariant: { select: { id: true } },
            saved: true,
          },
        },
      },
    })

    const bag = custWithData.bagItems?.filter(a => a.saved === false)
    const savedItems = custWithData.bagItems?.filter(a => a.saved === true)
    const customerPlanItemCount = custWithData.membership?.plan?.itemCount || 6

    if (bag.some(i => i.productVariant?.id === itemId)) {
      throw new ApolloError("Item already in bag", "515")
    }

    if (bag.length >= customerPlanItemCount) {
      throw new ApolloError("Bag is full", "514")
    }

    const existingSavedItemForVariant = savedItems.find(
      a => a.productVariant.id === itemId
    )
    const result = await this.prisma.client.bagItem.upsert({
      where: { id: existingSavedItemForVariant?.id || "" },
      create: {
        customer: {
          connect: {
            id: customer.id,
          },
        },
        productVariant: {
          connect: {
            id: itemId,
          },
        },
        position: 0,
        saved: false,
        status: "Added",
      },
      update: { saved: false },
      select,
    })
    return result
  }
  // Mutation for admins to swap a bagItem
  async swapBagItem(
    oldBagItemID,
    physicalProductWhere: Prisma.PhysicalProductWhereUniqueInput,
    select: Prisma.BagItemSelect
  ) {
    const oldBagItem = await this.prisma.client.bagItem.findUnique({
      where: {
        id: oldBagItemID,
      },
      select: {
        status: true,
        physicalProduct: {
          select: {
            id: true,
            warehouseLocation: true,
            inventoryStatus: true,
          },
        },
        productVariant: {
          select: {
            id: true,
            reservable: true,
            reserved: true,
            total: true,
            nonReservable: true,
            offloaded: true,
            stored: true,
          },
        },
        customer: {
          select: {
            id: true,
            membership: {
              select: {
                plan: {
                  select: {
                    tier: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    const promises = []
    const customerID = oldBagItem?.customer?.id
    const planTier = oldBagItem?.customer?.membership?.plan?.tier
    const productVariant = oldBagItem?.productVariant
    const lastReservation = (await this.utils.getLatestReservation(
      customerID,
      undefined
    )) as any

    if (!["Queued", "Hold"].includes(lastReservation.status)) {
      throw Error(
        "Only reservations with status Hold or Queued can have a bag item swapped"
      )
    }

    if (oldBagItem.status !== "Reserved") {
      throw Error("Only Reserved bag items can be swapped")
    }

    const oldPhysicalProduct = oldBagItem.physicalProduct

    promises.push(
      this.prisma.client.reservation.update({
        where: {
          id: lastReservation.id,
        },
        data: {
          products: {
            disconnect: {
              id: oldPhysicalProduct.id,
            },
          },
          newProducts: {
            disconnect: {
              id: oldPhysicalProduct.id,
            },
          },
          sentPackage: {
            update: {
              items: {
                disconnect: {
                  id: oldPhysicalProduct.id,
                },
              },
            },
          },
        },
      })
    )

    const oldPhysicalProductNewInventoryStatus = !!oldPhysicalProduct.warehouseLocation
      ? "Reservable"
      : "NonReservable"

    const oldProductVariantData = this.productVariantService.getCountsForStatusChange(
      {
        productVariant,
        oldInventoryStatus: oldPhysicalProduct.inventoryStatus as InventoryStatus,
        newInventoryStatus: oldPhysicalProductNewInventoryStatus,
      }
    )

    promises.push(
      this.prisma.client.physicalProduct.update({
        where: { id: oldPhysicalProduct.id },
        data: {
          inventoryStatus: oldPhysicalProductNewInventoryStatus,
          productVariant: {
            update: {
              ...oldProductVariantData,
            },
          },
        },
      })
    )

    promises.push(
      this.prisma.client.bagItem.delete({ where: { id: oldBagItemID } })
    )
    const newPhysicalProduct = await this.prisma.client.physicalProduct.findUnique(
      {
        where: physicalProductWhere,
      }
    )
    const newProductVariantID = newPhysicalProduct.productVariantId
    const [
      productVariantsCountsUpdatePromises,
      productsBeingReserved,
    ] = await this.productVariantService.updateProductVariantCounts(
      [newProductVariantID],
      customerID
    )
    promises.push(productVariantsCountsUpdatePromises)

    const newPhysicalProductID = newPhysicalProduct.id

    promises.push(
      this.prisma.client.reservation.update({
        where: {
          id: lastReservation.id,
        },
        data: {
          newProducts: {
            connect: {
              id: newPhysicalProductID,
            },
          },
          products: {
            connect: {
              id: newPhysicalProductID,
            },
          },
          sentPackage: {
            update: {
              items: {
                connect: {
                  id: newPhysicalProductID,
                },
              },
            },
          },
        },
      })
    )

    promises.push(
      this.prisma.client.physicalProduct.update({
        where: { id: newPhysicalProductID },
        data: { inventoryStatus: "Reserved" },
      })
    )
    promises.push(
      this.prisma.client.bagItem.create({
        data: {
          customer: {
            connect: { id: customerID },
          },
          productVariant: {
            connect: { id: newProductVariantID },
          },
          physicalProduct: {
            connect: { id: newPhysicalProduct.id },
          },
          status: "Reserved",
          saved: false,
        },
        select,
      })
    )
    if (planTier === "Access") {
      const activeRentalInvoice = await this.prisma.client.rentalInvoice.findFirst(
        {
          where: {
            reservations: {
              some: {
                id: lastReservation.id,
              },
            },
            status: "Draft",
          },
          select: {
            id: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }
      )
      promises.push(
        this.prisma.client.rentalInvoice.update({
          where: {
            id: activeRentalInvoice.id,
          },
          data: {
            products: {
              disconnect: {
                id: oldPhysicalProduct.id,
              },
              connect: {
                id: newPhysicalProduct.id,
              },
            },
          },
        })
      )
    }

    const results = await this.prisma.client.$transaction(promises.flat())
    const addedBagItem = results.pop()

    await this.reservationService.removeRestockNotifications(
      [newProductVariantID],
      customerID
    )

    return addedBagItem
  }

  async removeFromBag(item, saved, customer): Promise<BagItem> {
    // TODO: removeFromBag has been deprecated, use deleteBagItem
    const bagItem = await this.getBagItem(item, saved, customer, { id: true })

    if (!bagItem) {
      throw new ApolloError("Item can not be found", "514")
    }

    // has to return a promise because we roll it up in a transaction in at
    // least one parent function
    return await this.prisma.client.bagItem.delete({
      where: { id: bagItem.id },
    })
  }

  async getBagItem(
    item,
    saved,
    customer,
    select: Prisma.BagItemSelect = undefined // selects all scalars
  ): Promise<Partial<BagItem>> {
    const bagItem = await this.prisma.client.bagItem.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved,
      },
      select,
    })

    return bagItem
  }

  private getPhysicalProductFromLastReservationAndBagItem(
    lastReservation,
    bagItem
  ) {
    const physicalProductsInRes = lastReservation.products

    const physicalProduct = physicalProductsInRes.find(
      physProd => physProd.productVariant.id === bagItem.productVariant.id
    )

    if (!physicalProduct) {
      throw Error(
        `Physical product not in the last reservation: ${lastReservation.id}`
      )
    }

    return physicalProduct
  }
}
