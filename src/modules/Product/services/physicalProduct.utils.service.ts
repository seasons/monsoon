import { Injectable } from "@nestjs/common"
import { Category, PhysicalProduct, ProductVariant } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { head, uniqBy } from "lodash"

import { ProductUtilsService } from "./product.utils.service"

export interface PhysicalProductWithReservationSpecificData
  extends PhysicalProduct {
  productVariant: Pick<ProductVariant, "id">
}

@Injectable()
export class PhysicalProductUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService
  ) {}

  async getPhysicalProductsWithReservationSpecificData(items: string[]) {
    return await this.prisma.client.physicalProduct.findMany({
      where: {
        productVariant: {
          id: {
            in: items,
          },
        },
      },
      select: {
        id: true,
        seasonsUID: true,
        sequenceNumber: true,
        inventoryStatus: true,
        productStatus: true,
        productVariant: true,
      },
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
