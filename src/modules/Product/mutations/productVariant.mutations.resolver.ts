import { Resolver, Mutation, Args } from "@nestjs/graphql"
import { PrismaClientService } from "../../../prisma/client.service"
import { User } from "../../../nest_decorators"

@Resolver("ProductVariant")
export class ProductVariantMutationsResolver {
  constructor(private readonly prisma: PrismaClientService) {}

  @Mutation()
  async addProductVariantWant(@Args() { variantID }, @User() user) {
    if (!user) throw new Error("Missing user from context")

    const productVariant = await this.prisma.client.productVariant({
      id: variantID,
    })
    if (!productVariant) {
      throw new Error("Unable to find product variant with matching ID")
    }

    const productVariantWant = await this.prisma.client.createProductVariantWant(
      {
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
      }
    )
    return productVariantWant
  }
}
