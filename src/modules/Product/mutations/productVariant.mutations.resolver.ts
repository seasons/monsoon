import { Customer } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { ProductType } from "@app/prisma"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { Category, Color, Product } from "@prisma/client"
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

    const existingNotification = await this.prisma.client2.productNotification.findFirst(
      {
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
        orderBy: {
          createdAt: "desc",
        },
      }
    )

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

    return await this.prisma.client2.productNotification.upsert({
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
        category: { select: { measurementType: true } },
        color: { select: { id: true, colorCode: true } },
      },
    })) as Pick<Product, "id" | "retailPrice" | "status" | "type"> & {
      color: Pick<Color, "id" | "colorCode">
    } & {
      category: Pick<Category, "measurementType">
    }
    if (!product || !product.type) {
      throw new Error(
        `Can not create variant for product. Please check that it exists and has a valid type`
      )
    }

    const measurementType = product.category.measurementType

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
        measurementType,
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
