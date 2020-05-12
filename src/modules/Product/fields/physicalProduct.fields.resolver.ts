import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("PhysicalProduct")
export class PhysicalProductFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async barcode(@Parent() physicalProduct) {
    return (
      `SZNS` +
      `${
        (
          await this.prisma.client.physicalProduct({
            id: physicalProduct.id,
          })
        ).sequenceNumber
      }`.padStart(5, "0")
    )
  }
}
