import { Loader } from "@app/modules/DataLoader"
import { ReservationWhereInput } from "@app/prisma/prisma.binding"
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
    return physicalProductsLoader.load(physicalProduct.id)
  }

  @ResolveField()
  async reservations(
    @Parent() physicalProduct,
    @Loader({
      params: {
        query: "reservations",
        infoFragment: `fragment EnsureProductIDs on Reservation {products {id}}`,
        formatWhere: ids =>
          ({
            where: {
              products_some: {
                id_in: ids,
              },
            },
          } as ReservationWhereInput),
        getKeys: a => a.products.map(b => b.id),
        keyToDataRelationship: "ManyToMany",
      },
      includeInfo: true,
    })
    reservationsLoader: PrismaDataLoader<string>
  ) {
    const reservations = (await reservationsLoader.load(
      physicalProduct.id
    )) as any
    return reservations
  }
}
