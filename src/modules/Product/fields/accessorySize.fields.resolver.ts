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

type MeasurementType =
  | "height"
  | "width"
  | "minDrop"
  | "maxDrop"
  | "height"
  | "length"
  | "bridge"

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
    return this.getMeasurement(accessorySize, "bridge")
  }

  @ResolveField()
  async length(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    return this.getMeasurement(accessorySize, "length")
  }

  @ResolveField()
  async width(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    return this.getMeasurement(accessorySize, "width")
  }

  @ResolveField()
  async maxDrop(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    return this.getMeasurement(accessorySize, "maxDrop")
  }

  @ResolveField()
  async minDrop(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    return this.getMeasurement(accessorySize, "minDrop")
  }

  @ResolveField()
  async height(
    @Parent() parent,
    @Loader(measurementLoader)
    accessorySizeLoader
  ) {
    const accessorySize = await accessorySizeLoader.load(parent.id)
    return this.getMeasurement(accessorySize, "height")
  }

  private getMeasurement = (accessorySize, key: MeasurementType) => {
    const measurementType =
      accessorySize?.size?.productVariantInternal?.product?.category
        ?.measurementType
    if (measurementType && measurementType !== "Inches" && parent[key]) {
      return Math.round(
        this.productUtilsService.convertInchesToMeasurementSize(
          parent[key],
          measurementType
        )
      )
    } else {
      return parent[key]
    }
  }
}
