import { Customer } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { Image, Product, ProductModel } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import {
  PrismaTwoDataLoader,
  PrismaTwoLoader,
} from "@app/prisma/prisma2.loader"
import { ImageOptions, ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { ProductService } from "@modules/Product/services/product.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { sortedUniqBy } from "lodash"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly productUtilsService: ProductUtilsService,
    private readonly imageService: ImageService
  ) {}

  @ResolveField() //TODO:
  async isSaved(@Parent() product, @Customer() customer) {
    return this.productService.isSaved(product, customer)
  }

  @ResolveField()
  async modelHeight(
    @Parent() product,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Product",
        select: { id: true, model: { select: { id: true, height: true } } },
      },
    })
    productLoader: PrismaTwoDataLoader<{
      id: string
      model: Pick<ProductModel, "id" | "height">
    }>
  ) {
    const productWithModel = await productLoader.load(product.id)

    return productWithModel.model?.height
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
          fragment EnsureDisplay on ProductVariant {
              id
              product {
                id
              }
              internalSize {
                  display
                  bottom {
                    value
                  }
                  productType
              }
              offloaded
              total
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

    const type = productVariants?.[0]?.internalSize?.productType

    if (type === "Top") {
      return this.productUtilsService.sortVariants(productVariants)
    } else {
      // type === "Bottom". Note that if we add a new type, we may need to update this
      const sortedVariants = productVariants.sort((a, b) => {
        // @ts-ignore
        return a?.internalSize?.display - b?.internalSize?.display
      })
      const uniqueVariants = sortedUniqBy(
        sortedVariants,
        (a: any) => a?.internalSize?.bottom?.value
      )
      return uniqueVariants
    }
  }

  @ResolveField()
  async buyUsedEnabled(
    @Parent() product: Pick<Product, "id">,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Product",
        select: {
          id: true,
          variants: {
            select: {
              physicalProducts: {
                select: { price: { select: { buyUsedEnabled: true } } },
              },
            },
          },
        },
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
        select: {
          id: true,
          variants: {
            select: {
              physicalProducts: {
                select: { price: { select: { buyUsedPrice: true } } },
              },
            },
          },
        },
      },
    })
    productLoader: PrismaDataLoader<{
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
        select: {
          id: true,
          images: { select: { id: true, url: true, updatedAt: true } },
        },
      },
    })
    productLoader: PrismaDataLoader<{
      id: string
      images: Pick<Image, "id" | "url" | "updatedAt">[]
    }>
  ) {
    // Fetch the product's images sorted by url to ensure order is maintained
    // since image URLs for a product are the same except for the index at the end
    const product = await productLoader.load(parent.id)

    return product?.images.map(async image => {
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
