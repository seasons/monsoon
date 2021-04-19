import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import {
  AdminActionLog,
  AdminActionLogInterpretation,
  AdminActionLogInterpretationWhereInput,
  AdminActionLogWhereInput,
  PhysicalProduct,
  WarehouseLocation,
} from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaDataLoader } from "@prisma/prisma.loader"

import { PhysicalProductService } from "../services/physicalProduct.service"
import { PhysicalProductUtilsService } from "../services/physicalProduct.utils.service"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly physicalProductService: PhysicalProductService,
    private readonly physicalProductUtils: PhysicalProductUtilsService,
    private readonly utils: UtilsService
  ) {}

  @ResolveField()
  async barcode(
    @Parent() physicalProduct,
    @Loader({
      params: {
        query: "physicalProducts",
        info: `{ id sequenceNumber }`,
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
        query: `adminActionLogs`,
        formatWhere: keys => ({
          AND: [
            { entityId_in: keys },
            { tableName: "PhysicalProduct" },
          ] as AdminActionLogInterpretationWhereInput,
        }),
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.entityId],
      },
      includeInfo: true,
    })
    logsLoader: PrismaDataLoader<AdminActionLogInterpretation[]>
  ) {
    const logs = await logsLoader.load(physicalProduct.id)
    return logs
  }

  @ResolveField()
  async reservations(
    @Parent() physicalProduct,
    @Loader({
      params: {
        query: "reservations",
        formatWhere: ids => ({
          products_some: {
            id_in: ids,
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
