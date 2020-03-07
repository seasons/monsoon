import { Injectable } from "@nestjs/common"
import { ID_Input, PhysicalProduct, ProductVariant } from "../../../prisma"
import { DBService } from "../../../prisma/db.service"
import { uniqBy } from "lodash"
import { PrismaClientService } from "../../../prisma/client.service"

export interface PhysicalProductWithReservationSpecificData
  extends PhysicalProduct {
  productVariant: Pick<ProductVariant, "id">
}

@Injectable()
export class PhysicalProductService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService
  ) {}

  async getPhysicalProductsWithReservationSpecificData(
    items: ID_Input[]
  ): Promise<PhysicalProductWithReservationSpecificData[]> {
    return await this.db.query.physicalProducts(
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
}
