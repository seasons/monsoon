import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { ProductService } from "../services/product.service"
import { ProductUtilsService } from "../services/product.utils.service"

@Resolver("AccessorySize")
export class AccessorySizeFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
    private readonly productUtilsService: ProductUtilsService
  ) {}

  @ResolveField()
  async bridge(@Parent() parent) {
    const accessorySize = await this.prisma.client2.accessorySize.findUnique({
      where: { id: parent.id },
      select: {
        size: {
          select: {
            productVariantsInternal: {
              select: {
                productID: true,
              },
            },
          },
        },
      },
    })
    const productID = accessorySize?.size?.productVariantsInternal?.productID
    if (productID) {
      const product = await this.prisma.client2.product.findUnique({
        where: { slug: productID },
        select: {
          category: {
            select: {
              measurementType: true,
            },
          },
        },
      })

      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.bridge,
          product?.category?.measurementType
        )
      )
    }
  }

  @ResolveField()
  async length(@Parent() parent) {
    const accessorySize = await this.prisma.client2.accessorySize.findUnique({
      where: { id: parent.id },
      select: {
        size: {
          select: {
            productVariantsInternal: {
              select: {
                productID: true,
              },
            },
          },
        },
      },
    })
    const productID = accessorySize?.size?.productVariantsInternal?.productID
    if (productID) {
      const product = await this.prisma.client2.product.findUnique({
        where: { slug: productID },
        select: {
          category: {
            select: {
              measurementType: true,
            },
          },
        },
      })

      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.length,
          product?.category?.measurementType
        )
      )
    }
  }

  @ResolveField()
  async width(@Parent() parent) {
    const accessorySize = await this.prisma.client2.accessorySize.findUnique({
      where: { id: parent.id },
      select: {
        size: {
          select: {
            productVariantsInternal: {
              select: {
                productID: true,
              },
            },
          },
        },
      },
    })
    const productID = accessorySize?.size?.productVariantsInternal?.productID
    if (productID) {
      const product = await this.prisma.client2.product.findUnique({
        where: { slug: productID },
        select: {
          category: {
            select: {
              measurementType: true,
            },
          },
        },
      })

      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.width,
          product?.category?.measurementType
        )
      )
    }

    return undefined
  }

  //   @ResolveField()
  //   async modelHeight(
  //     @Parent() parent,
  //     @Loader({
  //       type: PrismaTwoLoader.name,
  //       params: {
  //         model: "Product",
  //         select: Prisma.validator<Prisma.ProductSelect>()({
  //           id: true,
  //           model: { select: { id: true, height: true } },
  //         }),
  //       },
  //     })
  //     productLoader: PrismaTwoDataLoader<{
  //       id: string
  //       model: Pick<ProductModel, "id" | "height">
  //     }>
  //   ) {
  //     let product = parent
  //     if (!parent.model?.height) {
  //       product = await productLoader.load(product.id)
  //     }

  //     return product.model?.height
  //   }
}
