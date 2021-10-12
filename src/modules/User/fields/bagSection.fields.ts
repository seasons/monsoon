import { Select } from "@app/decorators/select.decorator"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { merge } from "lodash"

@Resolver("BagSection")
export class BagSectionFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async bagItems(@Parent() parent, @Select() select) {
    return await this.prisma.client.bagItem.findMany({
      where: {
        id: {
          in: parent.bagItems.map(b => {
            return { id: b.id }
          }),
        },
      },
      select: merge(select, {
        id: true,
        status: true,
        updatedAt: true,
        physicalProduct: {
          select: {
            id: true,
          },
        },
      }),
    })
  }
}
