import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { PhysicalProductService } from "../services/physicalProduct.service"

@Resolver()
export class PhysicalProductMutationsResolver {
  constructor(
    private readonly physicalProductService: PhysicalProductService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async updatePhysicalProduct(@Args() { where, data }, @Info() info) {
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
}
