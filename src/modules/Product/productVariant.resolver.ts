import {
  Resolver,
  ResolveProperty,
  Context,
  Parent,
  Mutation,
  Args,
  Query
} from "@nestjs/graphql"
import { AuthService } from "../User/auth.service"
import { prisma } from "../../prisma"

@Resolver("ProductVariant")
export class ProductVariantResolver {
  constructor(private readonly authService: AuthService) {}

  @ResolveProperty()
  async isSaved(@Parent() parent, @Context() ctx) {
    let customer
    try {
      customer = await this.authService.getCustomerFromContext(ctx)
    } catch (error) {
      return false
    }

    const bagItems = await prisma.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        customer: {
          id: customer.id,
        },
        saved: true,
      },
    })

    return bagItems.length > 0
  }

  @ResolveProperty()
  async isWanted(@Parent() parent, @Context() ctx) {
    const user = await this.authService.getUserFromContext(ctx)
    if (!user) {
      return false
    }

    const productVariant = await prisma.productVariant({ id: parent.id })
    if (!productVariant) {
      return false
    }

    const productVariantWants = await prisma.productVariantWants({
      where: {
        user: {
          id: user.id,
        },
        AND: {
          productVariant: {
            id: productVariant.id,
          },
        },
      },
    })

    const exists = productVariantWants && productVariantWants.length > 0
    return exists
  }

  @Query()
  async productVariant(@Args() { where }) {
    return await prisma.productVariant(where)
  }

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
