import { Loader } from "@app/modules/DataLoader"
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
      type: PrismaLoader.name,
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
      type: PrismaLoader.name,
      params: {
        query: "reservations",
        infoFragment: `fragment EnsureProductIDs on Reservation {products {id}}`,
        formatWhere: ids => {
          where: {
            products_some: {
              id_in: ids
            }
          }
        },
      },
      includeInfo: true,
    })
    reservationsLoader: PrismaDataLoader<string>
  ) {
    debugger
    const reservations = (await reservationsLoader.load(
      physicalProduct.id
    )) as any
    console.log(reservations)
    return reservations.filter(a =>
      a.products.map(b => b.id).includes(physicalProduct.id)
    )
  }
}
