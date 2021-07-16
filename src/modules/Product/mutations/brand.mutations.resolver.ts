import { Select } from "@app/decorators/select.decorator"
import { BrandService } from "@modules/Product/services/brand.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

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
  async updateBrand(
    @Args() { where, data },
    @Select({ withFragment: "fragment EnsureId on Brand {id}" }) select
  ) {
    return await this.brand.updateBrand({ where, data, select })
  }
}
