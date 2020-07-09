import { Loader } from "@app/modules/DataLoader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaDataLoader, PrismaLoader } from "@prisma/prisma.loader"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
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
    prismaLoader: PrismaDataLoader<string>
  ) {
    return prismaLoader.load(physicalProduct.id)
  }
}
