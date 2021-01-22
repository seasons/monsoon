import { PhysicalProduct } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { head } from "lodash"

import { PhysicalProductService } from "../services/physicalProduct.service"

@Resolver()
export class PhysicalProductMutationsResolver {
  constructor(
    private readonly physicalProductService: PhysicalProductService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async updatePhysicalProduct(@Args() { where, data }, @Info() info) {
    if (data.price) {
      data.price = {
        upsert: { update: data.price, create: data.price },
      }
    }

    return await this.physicalProductService.updatePhysicalProduct({
      where,
      data,
      info,
    })
  }

  @Mutation()
  async updateManyPhysicalProducts(@Args() args, @Info() info) {
    return await this.prisma.binding.mutation.updateManyPhysicalProducts(
      args,
      info
    )
  }

  @Mutation()
  async createPhysicalProductQualityReport(@Args() args, @Info() info) {
    return await this.prisma.binding.mutation.createPhysicalProductQualityReport(
      args,
      info
    )
  }

  @Mutation()
  async updatePhysicalProductByBarcode(@Args() args, @Info() info) {
    const { barcode, status } = args
    const sequenceNumber = parseInt(barcode.replace("SZNS", ""), 10)

    const physicalProduct: PhysicalProduct = head(
      await this.prisma.binding.query.physicalProducts(
        {
          where: {
            sequenceNumber,
          },
        },
        `
      {
        id
        seasonsUID
        productStatus
      }
    `
      )
    )

    let updatedPhysicalProduct

    if (physicalProduct) {
      updatedPhysicalProduct = await this.prisma.client.updatePhysicalProduct({
        where: {
          seasonsUID: physicalProduct.seasonsUID,
        },
        data: {
          productStatus: status,
        },
      })
    }

    return updatedPhysicalProduct
  }
}
