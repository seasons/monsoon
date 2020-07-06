import { User } from "@app/decorators"
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
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

@Resolver("Customer")
export class CustomerFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService
  ) {}

  @ResolveField()
  async shouldRequestFeedback(@User() user) {
    if (!user) return null
    const feedbacks = await this.prisma.binding.query.reservationFeedbacks(
      {
        where: {
          user: { id: user.id },
        },
        orderBy: "respondedAt_DESC",
      },
      `
        {
          id
          respondedAt
        }
      `
    )
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    if (!feedbacks?.length) {
      return false
    } else {
      const feedback = head(feedbacks)
      const respondedAtDate =
        feedback?.respondedAt && new Date(feedback.respondedAt)
      if (!respondedAtDate || yesterday > respondedAtDate) {
        return true
      } else {
        return false
      }
    }
  }

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
    return await this.paymentService.getCustomerInvoiceHistory(
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

  @ResolveField()
  async user(@Parent() customer, @Info() info) {
    return await this.prisma.binding.query.user(
      {
        where: {
          id: await this.prisma.client
            .customer({
              id: customer.id,
            })
            .user()
            .id(),
        },
      },
      info
    )
  }

  @ResolveField()
  async onboardingSteps(@Parent() customer) {
    const steps: string[] = []

    const verificationStatus = await this.prisma.client
      .customer({ id: customer.id })
      .user()
      .verificationStatus()
    const height = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .height()
    const style = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .stylePreferences()
    const shippingAddress = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .shippingAddress()
      .address1()

    const values = [
      verificationStatus === "Approved",
      height !== null,
      style !== null,
      shippingAddress !== null,
    ]
    const keys = [
      "VerifiedPhone",
      "SetMeasurements",
      "SetStylePreferences",
      "SetShippingAddress",
    ]
    for (let i = 0; i < values.length; i++) {
      if (values[i]) {
        steps.push(keys[i])
      }
    }

    return steps
  }
}
