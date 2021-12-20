import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { Injectable } from "@nestjs/common"
import { Category, PhysicalProduct, Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { uniqBy } from "lodash"

const PhysicalProductWithReservationSpecificDataArgs = Prisma.validator<
  Prisma.PhysicalProductFindManyArgs
>()({
  select: {
    id: true,
    seasonsUID: true,
    sequenceNumber: true,
    inventoryStatus: true,
    productStatus: true,
    productVariant: { select: { id: true, product: { select: { id: true } } } },
    warehouseLocation: true,
  },
})

export type PhysicalProductWithReservationSpecificData = Prisma.PhysicalProductGetPayload<
  typeof PhysicalProductWithReservationSpecificDataArgs
>
@Injectable()
export class PhysicalProductUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService
  ) {}

  async getPhysicalProductsWithReservationSpecificData(
    items: string[]
  ): Promise<PhysicalProductWithReservationSpecificData[]> {
    return await this.prisma.client.physicalProduct.findMany({
      where: {
        productVariant: {
          id: {
            in: items,
          },
        },
      },
      select: PhysicalProductWithReservationSpecificDataArgs.select,
    })
  }

  extractUniqueNonreservablePhysicalProducts(
    physicalProducts: PhysicalProductWithReservationSpecificData[]
  ): PhysicalProductWithReservationSpecificData[] {
    return uniqBy(
      physicalProducts.filter(a => a.inventoryStatus !== "Reservable"),
      b => b.productVariant.id
    )
  }

  async getAllCategories(
    physProd: Pick<PhysicalProduct, "seasonsUID">
  ): Promise<Category[]> {
    return await this.productUtils.getAllCategoriesForProduct(
      await this.prisma.client.product.findFirst({
        where: {
          variants: {
            some: {
              physicalProducts: { some: { seasonsUID: physProd.seasonsUID } },
            },
          },
        },
      })
    )
  }

  async nextSequenceNumber(): Promise<number> {
    const lastPhysicalProduct = await this.prisma.client.physicalProduct.findFirst(
      {
        orderBy: { sequenceNumber: "desc" },
      }
    )

    return lastPhysicalProduct.sequenceNumber + 1
  }

  async groupedSequenceNumbers(inputs): Promise<any> {
    const lastPhysicalProduct = await this.prisma.client.physicalProduct.findFirst(
      {
        orderBy: { sequenceNumber: "desc" },
      }
    )
    let startingSequenceNumber = lastPhysicalProduct.sequenceNumber
    const groupedSequenceNumbers = []

    inputs.forEach(input => {
      const group = []
      input.physicalProducts.forEach(() => {
        startingSequenceNumber++
        group.push(startingSequenceNumber)
      })
      groupedSequenceNumbers.push(group)
    })

    return groupedSequenceNumbers
  }

  sequenceNumberToBarcode(sequenceNumber: number) {
    return `SZNS` + `${sequenceNumber}`.padStart(5, "0")
  }
}
