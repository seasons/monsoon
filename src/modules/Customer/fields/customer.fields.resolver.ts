import { InvoicesLoader, Loader } from "@modules/DataLoader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { InvoicesDataLoader } from "@modules/DataLoader/dataloader.types"
import { PaymentService } from "@modules/Payment/index"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService
  ) {}

  @ResolveField()
  async invoices(
    @Parent() customer,
    @Loader(InvoicesLoader.name) paymentLoader: InvoicesDataLoader
  ) {
    if (!customer) {
      return null
    }
    return this.paymentService.getCustomerInvoiceHistory(
      await this.prisma.client
        .customer({
          id: customer.id,
        })
        .user()
        .id(),
      paymentLoader
    )
  }
}
