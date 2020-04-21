import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { PaymentService } from "@modules/Payment/index"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService
  ) {}

  @ResolveField()
  async invoices(@Parent() customer) {
    if (!customer) {
      return null
    }
    return this.paymentService.getCustomerInvoiceHistory(
      await this.prisma.client
        .customer({
          id: customer.id,
        })
        .user()
        .id()
    )
  }
}
