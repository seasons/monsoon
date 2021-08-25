import { ErrorService } from "@app/modules/Error/services/error.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { BagItem, InventoryStatus, Prisma } from "@prisma/client"
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
    const customerPlanItemCount = custWithData.membership?.plan?.itemCount || 3

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

  /*
   * Mutation for admins to add a bagItem to a Customer bag manually
   */
  async addBagItemFromAdmin(
    customerID,
    physicalProduct,
    status,
    saved
  ): Promise<BagItem> {
    const promises = []
    const productVariantID = physicalProduct?.productVariantId
    if (status === "Reserved" && saved) {
      throw new Error("You cannot add a saved bag item with status Reserved")
    }

    if (status === "Reserved") {
      // Update the current reservation and it's physical product and counts
      const lastReservation = (await this.utils.getLatestReservation(
        customerID
      )) as any

      if (!this.statements.reservationIsActive(lastReservation)) {
        throw new Error(
          "To add a reserved item the customer must have an active reservation"
        )
      }

      const [
        productVariantsCountsUpdatePromises,
        productsBeingReserved,
      ] = await this.productVariantService.updateProductVariantCounts(
        [productVariantID],
        customerID
      )

      promises.push(productVariantsCountsUpdatePromises)

      const physicalProductID = physicalProduct.id

      promises.push(
        this.prisma.client.reservation.update({
          where: {
            id: lastReservation.id,
          },
          data: {
            newProducts: {
              connect: {
                id: physicalProductID,
              },
            },
            products: {
              connect: {
                id: physicalProductID,
              },
            },
            sentPackage: {
              update: {
                items: {
                  connect: {
                    id: physicalProductID,
                  },
                },
              },
            },
          },
        })
      )

      promises.push(
        this.prisma.client.physicalProduct.update({
          where: { id: physicalProductID },
          data: { inventoryStatus: "Reserved" },
        })
      )
    }

    promises.push(
      this.prisma.client.bagItem.create({
        data: {
          customer: {
            connect: { id: customerID },
          },
          productVariant: {
            connect: { id: productVariantID },
          },
          status,
          saved,
        },
      })
    )

    const results = await this.prisma.client.$transaction(promises.flat())
    const bagItem = results.pop()

    await this.reservationService.removeRestockNotifications(
      [productVariantID],
      customerID
    )

    return bagItem
  }

  /*
   * Mutation for admins to delete or return a bagItem from a customer's bag
   */
  async deleteBagItemFromAdmin(bagItemID, type: "Delete" | "Return") {
    const promises = []

    const bagItem = await this.prisma.client.bagItem.findUnique({
      where: {
        id: bagItemID,
      },
      select: {
        status: true,
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
          },
        },
      },
    })

    const customerID = bagItem.customer.id
    const productVariant = bagItem.productVariant
    const lastReservation = (await this.utils.getLatestReservation(
      customerID,
      undefined,
      {
        products: {
          select: {
            warehouseLocation: true,
          },
        },
      }
    )) as any

    if (
      !["Queued", "Hold"].includes(lastReservation.status) &&
      type === "Delete"
    ) {
      throw Error(
        "Only reservations with status Hold or Queued can have bag items deleted"
      )
    }

    if (bagItem.status === "Reserved" && type === "Delete") {
      // Update the current reservation and it's physical product and counts

      const physicalProduct = this.getPhysicalProductFromLastReservationAndBagItem(
        lastReservation,
        bagItem
      )

      promises.push(
        this.prisma.client.reservation.update({
          where: {
            id: lastReservation.id,
          },
          data: {
            products: {
              disconnect: {
                id: physicalProduct.id,
              },
            },
            newProducts: {
              disconnect: {
                id: physicalProduct.id,
              },
            },
            sentPackage: {
              update: {
                items: {
                  disconnect: {
                    id: physicalProduct.id,
                  },
                },
              },
            },
          },
        })
      )

      const newInventoryStatus = !!physicalProduct.warehouseLocation
        ? "Reservable"
        : "NonReservable"

      const productVariantData = this.productVariantService.getCountsForStatusChange(
        {
          productVariant,
          oldInventoryStatus: physicalProduct.inventoryStatus as InventoryStatus,
          newInventoryStatus,
        }
      )

      promises.push(
        this.prisma.client.physicalProduct.update({
          where: { id: physicalProduct.id },
          data: {
            inventoryStatus: newInventoryStatus,
            productVariant: {
              update: {
                ...productVariantData,
              },
            },
          },
        })
      )
    } else if (type === "Return") {
      const physicalProduct = this.getPhysicalProductFromLastReservationAndBagItem(
        lastReservation,
        bagItem
      )

      promises.push(
        this.prisma.client.reservation.update({
          data: {
            returnedProducts: {
              connect: {
                id: physicalProduct.id,
              },
            },
            returnedAt: new Date(),
          },
          where: { id: String(lastReservation.id) },
        })
      )
    }

    promises.push(
      this.prisma.client.bagItem.delete({ where: { id: bagItemID } })
    )

    await this.prisma.client.$transaction(promises)
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
