import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { PhysicalProductService } from "../services/physicalProduct.service"

@Resolver()
export class PhysicalProductMutationsResolver {
  constructor(
    private readonly physicalProductService: PhysicalProductService
  ) {}

  @Mutation()
  async updatePhysicalProduct(@Args() { where, data }, @Info() info) {
    return await this.physicalProductService.updatePhysicalProduct({
      where,
      data,
      info,
    })
  }
}
