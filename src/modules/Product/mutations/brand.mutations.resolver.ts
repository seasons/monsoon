import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { BrandService } from "../services/brand.service"

@Resolver("Brand")
export class BrandMutationsResolver {
  constructor(private readonly brandService: BrandService) {}

  @Mutation()
  async createBrand(@Args() { input }) {
    return await this.brandService.createBrand(input)
  }

  @Mutation()
  async updateBrand(@Args() { where, data }) {
    return await this.brandService.updateBrand({ where, data })
  }
}
