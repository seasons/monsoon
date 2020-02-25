import { Resolver, Context, Mutation, Args } from "@nestjs/graphql"
import { AuthService } from "../../User/auth.service"

@Resolver("ProductVariant")
export class ProductVariantMutationsResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  async addProductVariantWant(@Args() { variantID }, @Context() ctx) {
    const user = await this.authService.getUserFromContext(ctx)
    if (!user) {
      throw new Error("Missing user from context")
    }

    const productVariant = await ctx.prisma.productVariant({ id: variantID })
    if (!productVariant) {
      throw new Error("Unable to find product variant with matching ID")
    }

    const productVariantWant = await ctx.prisma.createProductVariantWant({
      isFulfilled: false,
      productVariant: {
        connect: {
          id: productVariant.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    })
    return productVariantWant
  }
}
