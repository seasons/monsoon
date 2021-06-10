import { Customer } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { Image, Product, ProductModel } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import {
  PrismaTwoDataLoader,
  PrismaTwoLoader,
} from "@app/prisma/prisma2.loader"
import { ImageOptions, ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { sortBy, sortedUniqBy } from "lodash"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(
    private readonly productUtilsService: ProductUtilsService,
    private readonly imageService: ImageService
  ) {}

  @ResolveField()
  async isSaved(
    @Parent() product,
    @Customer() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "BagItem",
        select: Prisma.validator<Prisma.BagItemSelect>()({
          id: true,
          productVariant: { select: { product: { select: { id: true } } } },
        }),
        formatWhere: (keys, ctx) =>
          Prisma.validator<Prisma.BagItemWhereInput>()({
            customer: { id: ctx.customer.id },
            productVariant: { product: { every: { id: { in: keys } } } },
            saved: true,
          }),
        getKeys: bagItem => [bagItem.productVariant.product.id],
        keyToDataRelationship: "OneToMany",
      },
    })
    bagItemsLoader
  ) {
    if (!customer) {
      return false
    }
    const bagItems = await bagItemsLoader.load(product.id)
    return bagItems.length > 0
  }

  @ResolveField()
  async modelHeight(
    @Parent() parent,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          model: { select: { id: true, height: true } },
        }),
      },
    })
    productLoader: PrismaTwoDataLoader<{
      id: string
      model: Pick<ProductModel, "id" | "height">
    }>
  ) {
    let product = parent
    if (!parent.model?.height) {
      product = await productLoader.load(product.id)
    }

    return product.model?.height
  }

  @ResolveField()
  async variants(
    @Parent() parent,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductVariant",
        formatWhere: ids => ({
          product: { every: { id: { in: ids } } },
        }),
        infoFragment: `
          fragment EnsureDisplayAndProductId on ProductVariant {
              id
              offloaded
              total
              displayShort
              product {
                id
              }
          }
        `,
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.product.id],
      },
      includeInfo: true,
    })
    productVariantLoader: PrismaDataLoader<any>
  ) {
    const productVariants = await productVariantLoader.load(parent.id)

    return this.productUtilsService.sortVariants(productVariants)
  }

  @ResolveField()
  async buyUsedEnabled(
    @Parent() product: Pick<Product, "id">,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          variants: {
            select: {
              physicalProducts: {
                select: { price: { select: { buyUsedEnabled: true } } },
              },
            },
          },
        }),
      },
    })
    productLoader: PrismaDataLoader<{
      variants?: Array<{
        physicalProducts?: Array<{
          price?: {
            buyUsedEnabled: boolean
          }
        }>
      }>
    }>
  ) {
    const productResult = await productLoader.load(product.id)

    // Assume all physical products associated with the product have the same
    // buyUsedEnabled configuration.
    return (
      productResult?.variants
        ?.flatMap(productVariant => productVariant.physicalProducts)
        ?.flatMap(physicalProduct => physicalProduct?.price)
        ?.some(price => price?.buyUsedEnabled) || false
    )
  }

  @ResolveField()
  async buyUsedPrice(
    @Parent() product: Pick<Product, "id">,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          variants: {
            select: {
              physicalProducts: {
                select: { price: { select: { buyUsedPrice: true } } },
              },
            },
          },
        }),
      },
    })
    productLoader: PrismaTwoDataLoader<{
      variants?: Array<{
        physicalProducts?: Array<{
          price?: {
            buyUsedPrice: number
          }
        }>
      }>
    }>
  ) {
    const productResult = await productLoader.load(product.id)

    // Assume all physical products associated with the product have the same
    // buyUsedEnabled configuration.
    const price = productResult?.variants
      ?.flatMap(productVariant => productVariant.physicalProducts)
      ?.flatMap(physicalProduct => physicalProduct?.price)
      ?.find(price => price?.buyUsedPrice)

    return price?.buyUsedPrice || null
  }

  @ResolveField()
  async images(
    @Parent() parent,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("size") size: ImageSize = "Medium",
    @Args("options") options: ImageOptions,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          images: { select: { id: true, url: true, updatedAt: true } },
        }),
      },
    })
    productLoader: PrismaDataLoader<{
      id: string
      images: Pick<Image, "id" | "url" | "updatedAt">[]
    }>
  ) {
    const product = await productLoader.load(parent.id)

    // Sort images by url to ensure order is maintained
    // since image URLs for a product are the same except for the index at the end
    const sortedImages = sortBy(product?.images, a => a.url)
    return sortedImages.map(async image => {
      const url = await this.imageService.resizeImage(image?.url, size, {
        ...options,
        w: width,
        h: height,
        updatedAt: image.updatedAt as string,
      })

      return {
        id: image?.id,
        url,
        entityType: "Product",
        entityID: product?.id,
      }
    })
  }
}
