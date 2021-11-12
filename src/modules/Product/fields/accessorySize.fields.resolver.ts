import { LoaderParams } from "@app/modules/DataLoader/dataloader.types.d"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"

const measurementLoader = {
  params: {
    model: "AccessorySize" as Prisma.ModelName,
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
} as LoaderParams

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
    if (measurementType && measurementType !== "Inches" && parent.bridge) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.bridge,
          measurementType
        )
      )
    } else {
      return parent.bridge
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
    if (measurementType && measurementType !== "Inches" && parent.length) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.length,
          measurementType
        )
      )
    } else {
      return parent.length
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
    if (measurementType && measurementType !== "Inches" && parent.width) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.width,
          measurementType
        )
      )
    } else {
      return parent.width
    }
  }

  @ResolveField()
  async maxDrop(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && measurementType !== "Inches" && parent.maxDrop) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.maxDrop,
          measurementType
        )
      )
    } else {
      return parent.maxDrop
    }
  }

  @ResolveField()
  async minDrop(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && measurementType !== "Inches" && parent.minDrop) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.minDrop,
          measurementType
        )
      )
    } else {
      return parent.minDrop
    }
  }

  @ResolveField()
  async height(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && measurementType !== "Inches" && parent.height) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent.height,
          measurementType
        )
      )
    } else {
      return parent.height
    }
  }
}
