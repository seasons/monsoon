import { Loader } from "@app/modules/DataLoader"
import {
  ReservationOrderByInput,
  ReservationWhereInput,
} from "@app/prisma/prisma.binding"
import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaDataLoader, PrismaLoader } from "@prisma/prisma.loader"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async barcode(
    @Parent() physicalProduct,
    @Loader({
      params: {
        query: "physicalProducts",
        info: `{ id sequenceNumber }`,
        formatData: a => `SZNS` + `${a.sequenceNumber}`.padStart(5, "0"),
      },
    })
    physicalProductsLoader: PrismaDataLoader<string>
  ) {
    return await physicalProductsLoader.load(physicalProduct.id)
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
