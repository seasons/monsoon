import { PrismaService } from "@app/prisma/prisma.service"
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("OrderItem")
export class OrderItemFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async productVariant(@Parent() orderItem, @Info() info) {
    const recordType = orderItem.recordType

    if (recordType === "PhysicalProduct") {
      const productVariantID = await this.prisma.client
        .physicalProduct({
          id: orderItem.recordID,
        })
        .productVariant()
        .id()

      return await this.prisma.binding.query.productVariant(
        {
          where: {
            id: productVariantID,
          },
        },
        info
      )
    } else if (recordType === "ProductVariant") {
      return await this.prisma.binding.query.productVariant(
        {
          where: {
            id: orderItem.recordID,
          },
        },
        info
      )
    } else {
      return null
    }
  }
}
