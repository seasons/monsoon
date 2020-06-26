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
    const inventoryStatusChanges = []
    const physProdIds = physicalProducts.map(a => a.id)

    await this.prisma.client.updateManyPhysicalProducts({
      where: { id_in: physProdIds },
      data: { inventoryStatus: "Reserved" },
    })
    for (const id of physProdIds) {
      inventoryStatusChanges.push(
        await this.prisma.client.createPhysicalProductInventoryStatusChange({
          old: "Reservable",
          new: "Reserved",
          physicalProduct: { connect: { id } },
        })
      )
    }

    const rollbackMarkPhysicalProductReservedOnPrisma = async () => {
      await this.prisma.client.updateManyPhysicalProducts({
        where: { id_in: physProdIds },
        data: { inventoryStatus: "Reservable" },
      })
      await this.prisma.client.deleteManyPhysicalProductInventoryStatusChanges({
        id_in: inventoryStatusChanges.map(a => a.id),
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

  async nextSequenceNumber(): Promise<number> {
    const physicalProduct = head(
      await this.prisma.client.physicalProducts({
        first: 1,
        orderBy: "sequenceNumber_DESC",
      })
    )

    return physicalProduct.sequenceNumber + 1
  }
}
