import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { ImageResizeService, ImageSize } from "@modules/Image"

import { Customer } from "@app/nest_decorators"
import { PrismaService } from "@prisma/prisma.service"
import { ProductService } from "@modules/Product/services/product.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { addFragmentToInfo } from "graphql-binding"
import { sortedUniqBy } from "lodash"

@Resolver("Product")
export class ProductFieldsResolver {
  private imageResizeService = new ImageResizeService()

  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly productUtilsService: ProductUtilsService
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
    @Args("size") size: ImageSize
  ) {
    const reservation = await this.prisma.binding.query.reservation(
      {
        where: {
          id: parent.id,
        },
      },
      `
      {
        products {
          id
          productVariant {
            product {
              images
            }
          }
        }
      }
      `
    )
    const products = reservation.products
    const firstImages = products.map(product => {
      const image = product.productVariant.product.images?.[0]

      return {
        url: this.imageResizeService.imageResize(image?.url, size),
      }
    })

    return firstImages
  }
}
