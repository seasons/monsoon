import { User } from "@app/decorators"
import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
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
import { head } from "lodash"

const getUserIDGenerateParams = {
  query: `customers`,
  info: `{user {id}}`,
  formatData: a => a.user.id,
}
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
    @Loader({
      name: "TransactionsFieldTransactionsForCustomerLoader",
      type: TransactionsForCustomersLoader.name,
    })
    transactionsForCustomerLoader: TransactionsDataLoader,
    @Loader({
      name: "TransactionsFieldPrismaLoader",
      type: PrismaLoader.name,
      generateParams: getUserIDGenerateParams,
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    if (!customer) {
      return null
    }
    const userId = await prismaLoader.load(customer.id)
    return this.paymentService.getCustomerTransactionHistory(
      userId,
      transactionsForCustomerLoader
    )
  }

  @ResolveField()
  async invoices(
    @Parent() customer,
    @Loader({
      name: "InvoicesFieldInvoicesForCustomerLoader",
      type: InvoicesForCustomersLoader.name,
    })
    invoicesLoader: InvoicesDataLoader,
    @Loader({
      name: "InvoicesFieldTransactionsForCustomerLoader",
      type: TransactionsForCustomersLoader.name,
    })
    transactionsForCustomerLoader: TransactionsDataLoader,
    @Loader({
      name: "InvoicesFieldPrismaLoader",
      type: PrismaLoader.name,
      generateParams: getUserIDGenerateParams,
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    if (!customer) {
      return null
    }
    const userId = await prismaLoader.load(customer.id)
    return await this.paymentService.getCustomerInvoiceHistory(
      userId,
      invoicesLoader,
      transactionsForCustomerLoader
    )
  }

  @ResolveField()
  async user(
    @Parent() customer,
    @Loader({
      name: "UserFieldPrismaUserIdLoader",
      type: PrismaLoader.name,
      generateParams: getUserIDGenerateParams,
    })
    userIdLoader: PrismaDataLoader<string>,
    @Loader({
      name: "UserFieldPrismaUserLoader",
      type: PrismaLoader.name,
      generateParams: { query: "users", info: "FROM_CONTEXT" },
    })
    userLoader: PrismaDataLoader<any>
  ) {
    const userId = await userIdLoader.load(customer.id)
    return userLoader.load(userId)
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
