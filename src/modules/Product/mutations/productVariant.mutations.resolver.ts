import { Customer, User } from "@app/decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import {
  Product as PrismaBindingProduct,
  ProductNotificationType,
} from "@prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

import { PhysicalProductUtilsService } from "../services/physicalProduct.utils.service"
import { ProductService } from "../services/product.service"
import { ProductVariantService } from "../services/productVariant.service"

@Resolver("ProductVariant")
export class ProductVariantMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly productVariantService: ProductVariantService,
    private readonly physicalProductUtilsService: PhysicalProductUtilsService
  ) {}

  @Mutation()
  async upsertRestockNotification(
    @Args() { variantID, shouldNotify },
    @Customer() customer
  ) {
    if (!customer) throw new Error("Missing customer from context")

    const restockNotifications = await this.prisma.client.productNotifications({
      where: {
        customer: {
          id: customer.id,
        },
        AND: {
          productVariant: {
            id: variantID,
          },
        },
      },
      orderBy: "createdAt_DESC",
    })

    const existingNotification = head(restockNotifications)

    const data = {
      shouldNotify: shouldNotify ? shouldNotify : false,
      type: "Restock" as ProductNotificationType,
      productVariant: {
        connect: {
          id: variantID,
        },
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
    }

    return await this.prisma.client.upsertProductNotification({
      where: { id: existingNotification?.id || "" },
      create: data,
      update: data,
    })
  }

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
      { where: { slug: productID } },
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
    if (!product || !product.status || !product.type) {
      return null
    }

    const sequenceNumbers = await this.physicalProductUtilsService.groupedSequenceNumbers(
      inputs
    )

    const variants = await Promise.all(
      inputs.map(async (input, index) => {
        return this.productService.deepUpsertProductVariant({
          sequenceNumbers: sequenceNumbers[index],
          variant: input,
          colorCode: product.color.colorCode,
          productID,
          retailPrice: product.retailPrice,
          status: product.status,
          type: product.type,
        })
      })
    )
    return variants
  }
}
