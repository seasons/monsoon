import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PrismaTwoLoader } from "@app/prisma/prisma2.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"

import { ProductUtilsService } from "../services/product.utils.service"

const measurementLoader = {
  type: PrismaTwoLoader.name,
  params: {
    model: "AccessorySize",
    select: Prisma.validator<Prisma.AccessorySizeSelect>()({
      id: true,
      size: {
        select: {
          productVariantInternal: {
            select: {
              product: {
                select: {
                  category: {
                    select: {
                      measurementType: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  },
}

@Resolver("AccessorySize")
export class AccessorySizeFieldsResolver {
  constructor(private readonly productUtilsService: ProductUtilsService) {}

  @ResolveField()
  async bridge(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && parent.bridge) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.bridge,
          measurementType
        )
      )
    } else {
      return undefined
    }
  }

  @ResolveField()
  async length(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && parent.length) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.length,
          measurementType
        )
      )
    } else {
      return undefined
    }
  }

  @ResolveField()
  async width(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && parent.width) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.width,
          measurementType
        )
      )
    } else {
      return undefined
    }
  }
}
