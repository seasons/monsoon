import { ErrorService } from "@app/modules/Error/services/error.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { BagItem, Prisma } from "@prisma/client"
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
    productVariantID,
    status,
    saved
  ): Promise<BagItem> {
    try {
      if (status === "Reserved") {
        // Update the current reservation and it's physical product and counts
        const lastReservation = await this.utils.getLatestReservation(
          customerID
        )

        if (!this.statements.reservationIsActive(lastReservation)) {
          throw new Error(
            "To add a reserved item the customer must have an active reservation"
          )
        }

        const [
          productVariantsCountsUpdatePromises,
          physicalProductsBeingReserved,
          productsBeingReserved,
        ] = await this.productVariantService.updateProductVariantCounts(
          [productVariantID],
          customerID
        )

        const physicalProductID = physicalProductsBeingReserved?.[0]?.id

        await this.prisma.client.reservation.update({
          where: {
            id: lastReservation?.id,
          },
          data: {
            newProducts: {
              connect: {
                id: physicalProductID,
              },
            },
          },
        })

        await this.prisma.client.physicalProduct.update({
          where: { id: physicalProductID },
          data: { inventoryStatus: "Reserved" },
        })
      }

      const bagItem = await this.prisma.client.bagItem.create({
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

      await this.reservationService.removeRestockNotifications(
        [productVariantID],
        customerID
      )

      return bagItem
    } catch (e) {
      console.log("Error addBagItemFromAdmin: ", e)
      this.error.captureError(e)
      throw new Error(e)
    }
  }

  /*
   * Mutation for admins to delete a bagItem from a customer's bag
   */
  async deleteBagItemFromAdmin(bagItemID) {
    const bagItem = await this.prisma.client.bagItem.findUnique({
      where: {
        id: bagItemID,
      },
      select: {
        status: true,
        productVariant: {
          select: {
            id: true,
          },
        },
        customer: {
          select: {
            id: true,
          },
        },
      },
    })

    const customerID = bagItem?.customer?.id

    if (bagItem.status === "Reserved") {
      // Update the current reservation and it's physical product and counts
      const lastReservation = await this.utils.getLatestReservation(customerID)

      const physicalProductsInRes = lastReservation.products

      const physicalProduct = physicalProductsInRes.find(
        physProd => physProd.productVariant.id === bagItem.productVariant.id
      )

      const filteredPhyProductIDs = physicalProductsInRes
        .filter(physProd => physProd.id !== physicalProduct.id)
        .map(physProd => {
          return {
            id: physProd.id,
          }
        })

      await this.prisma.client.reservation.update({
        where: {
          id: lastReservation?.id,
        },
        data: {
          products: {
            set: filteredPhyProductIDs,
          },
        },
      })

      await this.prisma.client.physicalProduct.update({
        where: { id: physicalProduct.id },
        data: { inventoryStatus: "Reservable" },
      })
    }

    await this.prisma.client.bagItem.delete({ where: { id: bagItemID } })
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
}
