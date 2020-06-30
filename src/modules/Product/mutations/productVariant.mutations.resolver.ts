import { User } from "@app/decorators"
import { ReservationService } from "@modules/Reservation"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { Product as PrismaBindingProduct } from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"
import { pick } from "lodash"

import { ProductService } from "../services/product.service"
import { ProductVariantService } from "../services/productVariant.service"

@Resolver("ProductVariant")
export class ProductVariantMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly productVariantService: ProductVariantService
  ) {}

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

  @Mutation()
  async updateProductVariant(@Args() { input }, @Info() info) {
    return await this.productVariantService.updateProductVariant(input, info)
  }

  @Mutation()
  async upsertProductVariants(@Args() { productID, inputs }, @Info() info) {
    const product: PrismaBindingProduct = await this.prisma.binding.query.product(
      { where: { id: productID } },
      `{
          id
          retailPrice
          status
          type
          color {
            id
            colorCode
          }
        }`
    )
    const { retailPrice, status, type } = product
    if (!retailPrice || !status || !type) {
      return null
    }

    const variants = await Promise.all(
      inputs.map(async input =>
        this.productService.deepUpsertProductVariant({
          variant: input,
          colorCode: product.color.colorCode,
          productID,
          retailPrice,
          status,
          type,
        })
      )
    )
    return variants
  }
}
