import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { Customer } from "@app/nest_decorators"
import { PrismaService } from "@prisma/prisma.service"
import { ProductService } from "@modules/Product/services/product.service"
import { ProductUtilsService } from "@modules/Product/services/product.utils.service"
import { addFragmentToInfo } from "graphql-binding"
import { sortedUniqBy } from "lodash"

@Resolver("Product")
export class ProductFieldsResolver {
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

    try {
      const sortedVariants = productVariants.sort((a, b) => {
        // @ts-ignore
        return a?.internalSize?.display - b?.internalSize?.display
      })
      const uniqueVariants = sortedUniqBy(
        sortedVariants,
        (a: any) => a?.internalSize?.display
      )
      return uniqueVariants
    } catch (e) {
      return []
    }
  }
}
