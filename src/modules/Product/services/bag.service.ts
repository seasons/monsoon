import { ApolloError } from "apollo-server"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

const BAG_SIZE = 3

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

    if (bag.length >= BAG_SIZE) {
      throw new ApolloError("Bag is full", "514")
    }

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
