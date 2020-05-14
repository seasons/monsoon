import { Customer } from "@app/decorators"
import { ImageService } from "@modules/Image"
import { ImageSize } from "@modules/Image/image.types"
import { ProductService } from "@modules/Product/services/product.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { addFragmentToInfo } from "graphql-binding"
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
  async variants(@Parent() parent, @Info() info) {
    const productVariants = await this.prisma.binding.query.productVariants(
      {
        where: {
          product: {
            id: parent.id,
          },
        },
      },
      addFragmentToInfo(
        info,
        `
          fragment EnsureDisplay on ProductVariant {
              internalSize {
                  display
                  productType
              }
          }
      `
      )
    )

    const type = productVariants?.[0]?.internalSize?.productType

    if (type === "Top") {
      return this.productUtilsService.sortVariants(productVariants)
    }

    const sortedVariants = productVariants.sort((a, b) => {
      // @ts-ignore
      return a?.internalSize?.display - b?.internalSize?.display
    })
    const uniqueVariants = sortedUniqBy(
      sortedVariants,
      (a: any) => a?.internalSize?.display
    )
    return uniqueVariants
  }

  @ResolveField()
  async images(
    @Parent() parent,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("size") size: ImageSize = "Medium"
  ) {
    // Fetch the product's images sorted by updatedAt because if
    // we sorted by createdAt, anytime we updated a product's image,
    // it would be returned as the last image
    const product = await this.prisma.binding.query.product(
      {
        where: {
          id: parent.id,
        },
      },
      `
      {
        id
        images(orderBy: updatedAt_ASC) {
          id
          url
        }
      }
      `
    )
    return product?.images.map(image => {
      return {
        id: image?.id,
        url: this.imageService.resizeImage(image?.url, size, {
          w: width,
          h: height,
        }),
        entityType: "Product",
        entityID: product?.id,
      }
    })
  }
}
