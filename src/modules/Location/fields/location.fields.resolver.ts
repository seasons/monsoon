import { PrismaService } from "@app/prisma/prisma.service"
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("Location")
export class LocationFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  //   @ResolveField()
  //   async salesTaxTotal(@Parent() order) {
  //     return order?.lineItems.reduce((sum, lineItem) => {
  //       return sum + lineItem.taxPrice
  //     }, 0)
  //   }
}
