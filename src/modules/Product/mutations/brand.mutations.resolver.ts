import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { BrandService } from "../services/brand.service"

@Resolver("Brand")
export class BrandMutationsResolver {
  constructor(private readonly brand: BrandService) {}

  @Mutation()
  async createBrand(@Args() { input }) {
    if (input.externalShopifyIntegration) {
      input.externalShopifyIntegration = {
        create: input.externalShopifyIntegration,
      }
    }

    return await this.brand.createBrand({ input })
  }

  @Mutation()
  async updateBrand(@Args() { where, data }) {
    if (data.externalShopifyIntegration) {
      data.externalShopifyIntegration = {
        update: data.externalShopifyIntegration,
      }
    }

    return await this.brand.updateBrand({ where, data })
  }
}
