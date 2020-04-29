import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { Loader } from "@modules/DataLoader"
import {
  InvoicesForCustomersLoader,
  PaymentService,
} from "@modules/Payment/index"
import {
  InvoicesDataLoader,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService
  ) {}

  @ResolveField()
  async transactions(
    @Parent() customer,
    @Loader(TransactionsForCustomersLoader.name)
    transactionsForCustomerLoader: TransactionsDataLoader
  ) {
    if (!customer) {
      return null
    }
    return this.paymentService.getCustomerTransactionHistory(
      await this.prisma.client
        .customer({
          id: customer.id,
        })
        .user()
        .id(),
      transactionsForCustomerLoader
    )
  }

  @ResolveField()
  async invoices(
    @Parent() customer,
    @Loader(InvoicesForCustomersLoader.name) invoicesLoader: InvoicesDataLoader,
    @Loader(TransactionsForCustomersLoader.name)
    transactionsForCustomerLoader: TransactionsDataLoader
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
      transactionsForCustomerLoader
    )
  }
}
