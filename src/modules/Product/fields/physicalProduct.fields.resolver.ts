import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PhysicalProduct } from "@app/prisma"
import {
  PrismaTwoDataLoader,
  PrismaTwoLoader,
} from "@app/prisma/prisma2.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { PrismaDataLoader } from "@prisma1/prisma.loader"

import { PhysicalProductUtilsService } from "../services/physicalProduct.utils.service"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
  constructor(
    private readonly physicalProductUtils: PhysicalProductUtilsService
  ) {}

  @ResolveField()
  async barcode(
    @Parent() physicalProduct,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "PhysicalProduct",
        select: Prisma.validator<Prisma.PhysicalProductSelect>()({
          id: true,
          sequenceNumber: true,
        }),
      },
    })
    physicalProductsLoader: PrismaDataLoader<PhysicalProduct>
  ) {
    const loadedPhysicalProduct = await physicalProductsLoader.load(
      physicalProduct.id
    )
    return this.physicalProductUtils.sequenceNumberToBarcode(
      loadedPhysicalProduct.sequenceNumber
    )
  }

  @ResolveField()
  async adminLogs(
    @Parent() physicalProduct,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: `AdminActionLog`,
        formatWhere: keys => ({
          AND: [{ entityId: { in: keys } }, { tableName: "PhysicalProduct" }],
        }),
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.entityId],
      },
      includeInfo: true,
    })
    logsLoader: PrismaTwoDataLoader
  ) {
    const logs = await logsLoader.load(physicalProduct.id)
    return logs
  }

  @ResolveField()
  async reservations(
    @Parent() physicalProduct,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Reservation",
        formatWhere: ids => ({
          products: {
            some: {
              id: { in: ids },
            },
          },
        }),
        infoFragment: `fragment EnsureProductIDs on Reservation {products {id}}`,
        getKeys: a => a.products.map(b => b.id),
        keyToDataRelationship: "ManyToMany",
      },
      includeInfo: true,
      includeOrderBy: true,
    })
    reservationsLoader: PrismaDataLoader<string>
  ) {
    return reservationsLoader.load(physicalProduct.id)
  }
}
