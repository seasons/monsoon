import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import {
  AdminActionLog,
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
          ] as AdminActionLogWhereInput,
        }),
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.entityId],
      },
      includeInfo: true,
    })
    logsLoader: PrismaDataLoader<AdminActionLog[]>,
    @Loader({
      params: {
        query: `warehouseLocations`,
        formatWhere: keys => ({ id_in: keys }),
        keyToDataRelationship: "OneToOne",
        info: `{id barcode}`,
      },
    })
    locationsLoader: PrismaDataLoader<WarehouseLocation[]>
  ) {
    const logs = await logsLoader.load(physicalProduct.id)
    console.log(logs)
    const allReferencedWarehouseLocations = logs
      .map(a => a.changedFields)
      .filter(b => b["warehouseLocation"] != null)
      .map(c => c["warehouseLocation"])
    console.log(allReferencedWarehouseLocations)
    const warehouseLocations = await locationsLoader.loadMany(
      allReferencedWarehouseLocations
    )
    console.log(warehouseLocations)
    return this.physicalProductService.interpretPhysicalProductLogs(
      logs,
      warehouseLocations as any
    )
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
