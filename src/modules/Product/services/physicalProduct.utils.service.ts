import { Injectable } from "@nestjs/common"
import {
  Category,
  ID_Input,
  PhysicalProduct,
  ProductVariant,
} from "@prisma1/index"
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
    const _physicalProducts = this.prisma.client2.physicalProduct.findMany({
      where: {
        productVariant: {
          some: {
            id: {
              in: items,
            },
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

    return this.prisma.sanitizePayload(_physicalProducts, "PhysicalProduct")
  }

  extractUniqueNonreservablePhysicalProducts(
    physicalProducts: PhysicalProductWithReservationSpecificData[]
  ): PhysicalProductWithReservationSpecificData[] {
    return uniqBy(
      physicalProducts.filter(a => a.inventoryStatus !== "Reservable"),
      b => b.productVariant.id
    )
  }

  async getAllCategories(physProd: PhysicalProduct): Promise<Category[]> {
    return await this.productUtils.getAllCategories(
      head(
        await this.prisma.client.products({
          where: {
            variants_some: {
              physicalProducts_some: { seasonsUID: physProd.seasonsUID },
            },
          },
        })
      )
    )
  }

  async nextSequenceNumber(): Promise<number> {
    const lastPhysicalProduct = head(
      await this.prisma.client.physicalProducts({
        first: 1,
        orderBy: "sequenceNumber_DESC",
      })
    )

    return lastPhysicalProduct.sequenceNumber + 1
  }

  async groupedSequenceNumbers(inputs): Promise<any> {
    const lastPhysicalProduct = head(
      await this.prisma.client.physicalProducts({
        first: 1,
        orderBy: "sequenceNumber_DESC",
      })
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
