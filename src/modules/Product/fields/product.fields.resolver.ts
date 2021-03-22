import { Customer } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { Product } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { ImageOptions, ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { ProductService } from "@modules/Product/services/product.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { sortedUniqBy } from "lodash"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly productUtilsService: ProductUtilsService,
    private readonly imageService: ImageService
  ) {}

  @ResolveField()
  async isSaved(@Parent() product, @Customer() customer) {
    return this.productService.isSaved(product, customer)
  }

  @ResolveField()
  async modelHeight(@Parent() product) {
    const productWithModel = await this.prisma.binding.query.product(
      {
        where: { id: product.id },
      },
      `
    {
      model {
        id
        height
      }
    }
    `
    )

    return productWithModel.model?.height
  }

  @ResolveField()
  async variants(
    @Parent() parent,
    @Info() info,
    @Application() application,
    @Loader({
      params: {
        query: "productVariants",
        formatWhere: ids => ({
          product: { id_in: ids },
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
      params: {
        query: "products",
        info: `{
          id
          variants {
            physicalProducts {
              price {
                buyUsedEnabled
              }
            }
          }
        }`,
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
        query: "products",
        info: `{
          id
          variants {
            physicalProducts {
              price {
                buyUsedPrice
              }
            }
          }
        }`,
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
    @Args("options") options: ImageOptions
  ) {
    // Fetch the product's images sorted by url to ensure order is maintained
    // since image URLs for a product are the same except for the index at the end
    const product = await this.prisma.binding.query.product(
      {
        where: {
          id: parent.id,
        },
      },
      `
      {
        id
        images(orderBy: url_ASC) {
          id
          url
          updatedAt
        }
      }
      `
    )

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
