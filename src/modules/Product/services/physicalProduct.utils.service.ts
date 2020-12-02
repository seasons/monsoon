import { Injectable } from "@nestjs/common"
import {
  Category,
  ID_Input,
  PhysicalProduct,
  ProductVariant,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
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

  async getPhysicalProductsWithReservationSpecificData(
    items: ID_Input[]
  ): Promise<PhysicalProductWithReservationSpecificData[]> {
    return await this.prisma.binding.query.physicalProducts(
      {
        where: {
          productVariant: {
            id_in: items as string[],
          },
        },
      },
      `{
            id
            seasonsUID
            inventoryStatus
            productVariant {
                id
            }
        }`
    )
  }

  extractUniqueReservablePhysicalProducts(
    physicalProducts: PhysicalProductWithReservationSpecificData[]
  ): PhysicalProductWithReservationSpecificData[] {
    return uniqBy(
      physicalProducts.filter(a => a.inventoryStatus === "Reservable"),
      b => b.productVariant.id
    )
  }

  async markPhysicalProductsReservedOnPrisma(
    physicalProducts: PhysicalProduct[]
  ): Promise<() => void> {
    const physProdIds = physicalProducts.map(a => a.id)

    await this.prisma.client.updateManyPhysicalProducts({
      where: { id_in: physProdIds },
      data: { inventoryStatus: "Reserved" },
    })

    const rollbackMarkPhysicalProductReservedOnPrisma = async () => {
      await this.prisma.client.updateManyPhysicalProducts({
        where: { id_in: physProdIds },
        data: { inventoryStatus: "Reservable" },
      })
    }

    return rollbackMarkPhysicalProductReservedOnPrisma
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
}
