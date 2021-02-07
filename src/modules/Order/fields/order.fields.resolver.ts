import { PrismaService } from "@app/prisma/prisma.service"
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("Order")
export class OrderFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async salesTaxTotal(@Parent() order) {
    const calculateSalesTax = (price, taxRate) => (taxRate / 100) * price
    console.log("orderitem", order.items)
    let total = 0
    order?.items.map(item => {
      const itemTax = calculateSalesTax(item.price, item.taxPercentage)
      total = total + itemTax
    })
    return total
  }
}
