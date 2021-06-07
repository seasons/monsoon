import { Injectable } from "@nestjs/common"
import { BagItem, Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { head } from "lodash"

@Injectable()
export class BagService {
  constructor(private readonly prisma: PrismaService) {}

  async addToBag(
    itemId,
    customer,
    select: Prisma.BagItemSelect
  ): Promise<Partial<BagItem>> {
    const custWithData = await this.prisma.client2.customer.findUnique({
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

    // If bag item is in saved list delete it
    const existingSavedItemForVariant = savedItems.find(
      a => a.productVariant.id === itemId
    )
    const result = await this.prisma.client2.bagItem.upsert({
      where: { id: existingSavedItemForVariant.id || "" },
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

  async removeFromBag(item, saved, customer) {
    const bagItems = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved,
      },
    })
    const bagItem = head(bagItems)

    if (!bagItem) {
      throw new ApolloError("Item can not be found", "514")
    }

    return await this.prisma.client.deleteBagItem({
      id: bagItem.id,
    })
  }
}
