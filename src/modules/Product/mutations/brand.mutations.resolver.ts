import { Select } from "@app/decorators/select.decorator"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { BrandService } from "../services/brand.service"

@Resolver("Brand")
export class BrandMutationsResolver {
  constructor(private readonly brand: BrandService) {}

  @Mutation()
  async createBrand(@Args() { input }, @Select() select) {
    if (input.shopifyShop) {
      input.shopifyShop = {
        create: input.shopifyShop,
      }
    }

    return await this.brand.createBrand({ input, select })
  }

  @Mutation()
  async updateBrand(@Args() { where, data }) {
    return await this.brand.updateBrand({ where, data })
  }
}
