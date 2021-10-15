import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import { Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class ShippingQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async shippingMethods(@FindManyArgs() args) {
    return this.prisma.client.shippingMethod.findMany({
      ...args,
    })
  }
}
