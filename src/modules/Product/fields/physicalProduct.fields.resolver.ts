import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PhysicalProduct } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaDataLoader } from "@prisma/prisma.loader"

import { PhysicalProductUtilsService } from "../services/physicalProduct.utils.service"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly physicalProductUtils: PhysicalProductUtilsService
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
