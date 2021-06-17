import { Customer, User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { ProductStatus, ProductType } from "@app/prisma"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { Color, Product } from "@prisma/client"
import { ProductNotificationType } from "@prisma1/prisma.binding"
import { PrismaService } from "@prisma1/prisma.service"
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
  async addProductVariantWant() {
    throw new Error(`Deprecated. Use product restock notification instead`)
  }

  @Mutation()
  async updateProductVariant(@Args() { input }, @Select() select) {
    return await this.productVariantService.updateProductVariant(input, select)
  }

  @Mutation()
  async createProductVariants(@Args() { productID, inputs }, @Select() select) {
    const product = (await this.prisma.client2.product.findUnique({
      where: { slug: productID },
      select: {
        id: true,
        retailPrice: true,
        type: true,
        color: { select: { id: true, colorCode: true } },
      },
    })) as Pick<Product, "id" | "retailPrice" | "status" | "type"> & {
      color: Pick<Color, "id" | "colorCode">
    }
    if (!product || !product.status || !product.type) {
      return null
    }

    const sequenceNumbers = await this.physicalProductUtilsService.groupedSequenceNumbers(
      inputs
    )

    const variantPromises = inputs.map((input, index) => {
      return this.productService.getCreateProductVariantPromises({
        sequenceNumbers: sequenceNumbers[index],
        variant: input,
        colorCode: product.color.colorCode,
        productSlug: productID,
        retailPrice: product.retailPrice,
        type: product.type as ProductType,
      })
    })
    const results = await this.prisma.client2.$transaction(
      variantPromises.flat()
    )
    const createdVariants = results.filter(a => !!a.sku)
    const _variantsToReturn = await this.prisma.client2.productVariant.findMany(
      {
        where: { sku: { in: createdVariants.map(a => a.sku) } },
        select,
      }
    )
    const variantsToReturn = this.prisma.sanitizePayload(
      _variantsToReturn,
      "ProductVariant"
    )
    return variantsToReturn
  }

  @Mutation()
  async addPhysicalProductsToVariant(
    @Args() { variantID, count }: { variantID: string; count: number },
    @Select() select
  ) {
    await this.productVariantService.addPhysicalProducts(variantID, count)
    const variant = await this.prisma.client2.productVariant.findUnique({
      where: { id: variantID },
      select,
    })
    return this.prisma.sanitizePayload(variant, "ProductVariant")
  }
}
