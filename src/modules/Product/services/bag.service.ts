import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { ApolloError } from "apollo-server"
import { head } from "lodash"

@Injectable()
export class BagService {
  constructor(private readonly prisma: PrismaService) {}

  async addToBag(item, customer) {
    const bag = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
    })

    const customerPlanItemCount = await this.prisma.client
      .customer({ id: customer.id })
      .membership()
      .plan()
      .itemCount()

    if (bag.length >= customerPlanItemCount) {
      throw new ApolloError("Bag is full", "514")
    }

    // If bag item is in saved list delete it
    const savedBagItems = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved: true,
      },
    })
    const savedBagItem = head(savedBagItems)
    if (savedBagItem) {
      return await this.prisma.client.updateBagItem({
        where: { id: savedBagItem.id },
        data: { saved: false },
      })
    } else {
      return await this.prisma.client.createBagItem({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        productVariant: {
          connect: {
            id: item,
          },
        },
        position: 0,
        saved: false,
        status: "Added",
      })
    }
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
