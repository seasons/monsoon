import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PhysicalProduct } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"

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
      params: {
        model: `AdminActionLog`,
        formatWhere: keys =>
          Prisma.validator<Prisma.AdminActionLogWhereInput>()({
            AND: [
              { entityId: { in: keys } },
              { tableName: "PhysicalProduct" },
              { interpretation: { id: { not: undefined } } },
            ],
          }),
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.entityId],
      },
      includeInfo: true,
    })
    logsLoader: PrismaDataLoader
  ) {
    const logs = await logsLoader.load(physicalProduct.id)
    return logs
  }

  @ResolveField()
  async reservations(
    @Parent() physicalProduct,
    @Loader({
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
