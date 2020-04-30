import { User } from "@app/nest_decorators"
import { ReservationService } from "@modules/Reservation"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("ProductVariant")
export class ProductVariantMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

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
