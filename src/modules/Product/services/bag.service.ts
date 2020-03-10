import { Injectable } from "@nestjs/common"
import { PrismaClientService } from "../../../prisma/client.service"
import { ApolloError } from "apollo-server"

const BAG_SIZE = 3

@Injectable()
export class BagService {
  constructor(private readonly prisma: PrismaClientService) {}
  
  async addToBag(item, customer) {
    // Check if the user still can add more items to bag
    // If not throw error

    // Check if the bag item already exists
    // Upsert it instead
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
}
