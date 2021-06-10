import { Injectable } from "@nestjs/common"
import { Category } from "@prisma/client"
import { ID_Input, PhysicalProduct, ProductVariant } from "@prisma1/index"
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

  async getPhysicalProductsWithReservationSpecificData(
    items: ID_Input[]
  ): Promise<PhysicalProductWithReservationSpecificData[]> {
    const _prods = await this.prisma.client2.physicalProduct.findMany({
      where: {
        productVariant: {
          every: { id: { in: items as string[] } },
        },
      },
      select: {
        id: true,
        seasonsUID: true,
        inventoryStatus: true,
        productVariant: { select: { id: true } },
      },
    })
    return (this.prisma.sanitizePayload(
      _prods,
      "PhysicalProduct"
    ) as unknown) as PhysicalProductWithReservationSpecificData[]
  }

  extractUniqueReservablePhysicalProducts(
    physicalProducts: PhysicalProductWithReservationSpecificData[]
  ): PhysicalProductWithReservationSpecificData[] {
    return uniqBy(
      physicalProducts.filter(a => a.inventoryStatus === "Reservable"),
      b => b.productVariant.id
    )
  }

  extractUniqueNonreservablePhysicalProducts(
    physicalProducts: PhysicalProductWithReservationSpecificData[]
  ): PhysicalProductWithReservationSpecificData[] {
    return uniqBy(
      physicalProducts.filter(a => a.inventoryStatus !== "Reservable"),
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
      await this.prisma.client2.product.findFirst({
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
    const lastPhysicalProduct = head(
      await this.prisma.client.physicalProducts({
        first: 1,
        orderBy: "sequenceNumber_DESC",
      })
    )

    return lastPhysicalProduct.sequenceNumber + 1
  }

  async groupedSequenceNumbers(inputs): Promise<any> {
    const lastPhysicalProduct = await this.prisma.client2.physicalProduct.findFirst(
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
