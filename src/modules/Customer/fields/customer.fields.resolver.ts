import {
  InvoicesDataLoader,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"
// import { PaymentService, InvoicesLoader } from "@modules/Payment/index"
import {
  InvoicesLoader,
  PaymentService,
  TransactionsLoader,
} from "@modules/Payment/index"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { Loader } from "@modules/DataLoader"
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
    @Loader(InvoicesLoader.name) invoicesLoader: InvoicesDataLoader,
    @Loader(TransactionsLoader.name) transactionsLoader: TransactionsDataLoader
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
      invoicesLoader,
      transactionsLoader
    )
  }
}
