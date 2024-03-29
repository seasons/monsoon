import { Customer } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { PrismaService } from "@app/prisma/prisma.service"
import { ImageOptions, ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import {
  Brand,
  Category,
  Color,
  Image,
  Product,
  ProductModel,
} from "@prisma/client"
import { Prisma } from "@prisma/client"
import { sortBy } from "lodash"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(
    private readonly productUtilsService: ProductUtilsService,
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async rentalPrice(
    @Parent() parent,
    @Loader({
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          computedRentalPrice: true,
        }),
      },
    })
    productLoader: PrismaDataLoader<Pick<Product, "id" | "computedRentalPrice">>
  ) {
    const product = await productLoader.load(parent.id)
    return product.computedRentalPrice
  }

  @ResolveField()
  async isSaved(
    @Parent() product,
    @Customer() customer,
    @Loader({
      params: {
        model: "BagItem",
        select: Prisma.validator<Prisma.BagItemSelect>()({
          id: true,
          productVariant: { select: { product: { select: { id: true } } } },
        }),
        formatWhere: (keys, ctx) =>
          Prisma.validator<Prisma.BagItemWhereInput>()({
            customer: { id: ctx.customer.id },
            productVariant: { product: { id: { in: keys } } },
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
  async relatedProducts(
    @Parent() parent,
    @Select() select,
    @Args() { take },
    @Loader({
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          category: {
            select: {
              id: true,
            },
          },
          brand: {
            select: {
              id: true,
            },
          },
          color: {
            select: {
              id: true,
            },
          },
        }),
      },
    })
    productLoader: PrismaDataLoader<{
      id: string
      category: Category
      brand: Brand
      color: Color
    }>
  ) {
    const product = await productLoader.load(parent.id)
    const relatedProducts = await this.prisma.client.product.findMany({
      where: {
        category: { id: product.category.id },
        brand: { id: { not: product.brand.id } },
        status: "Available",
      },
      select: {
        ...select,
      },
      take,
    })
    const sortedRelatedProducts = relatedProducts.sort((a: any, b: any) => {
      if (b.color.id === product.color.id) {
        return 1
      }
      return -1
    })
    return sortedRelatedProducts
  }

  @ResolveField()
  async modelHeight(
    @Parent() parent,
    @Loader({
      params: {
        model: "Product",
        select: Prisma.validator<Prisma.ProductSelect>()({
          id: true,
          model: { select: { id: true, height: true } },
        }),
      },
    })
    productLoader: PrismaDataLoader<{
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
      params: {
        model: "ProductVariant",
        formatWhere: ids => ({
          product: { id: { in: ids } },
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
              internalSize {
                productType
                display
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
        //@ts-ignore
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
