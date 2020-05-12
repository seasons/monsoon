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
    const physicalProductIDs = physicalProducts.map(a => a.id)
    await this.prisma.client.updateManyPhysicalProducts({
      where: { id_in: physicalProductIDs },
      data: { inventoryStatus: "Reserved" },
    })
    const rollbackMarkPhysicalProductReservedOnPrisma = async () => {
      await this.prisma.client.updateManyPhysicalProducts({
        where: { id_in: physicalProductIDs },
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
}
