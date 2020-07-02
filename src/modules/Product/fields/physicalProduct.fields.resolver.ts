import { Loader } from "@app/modules/DataLoader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaDataLoader, PrismaLoader } from "@prisma/prisma.loader"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
  @ResolveField()
  async barcode(
    @Parent() physicalProduct,
    @Loader({
      name: PrismaLoader.name,
      generateParams: {
        query: "physicalProducts",
        info: `{ sequenceNumber }`,
        format: a => `SZNS` + `${a.sequenceNumber}`.padStart(5, "0"),
      },
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    return prismaLoader.load(physicalProduct.id)
  }
}
