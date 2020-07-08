import { User } from "@app/decorators"
import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { PaymentPlan, Plan } from "@app/prisma"
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
  info: `{
    id
    user {
      id
    }
  }`,
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
      type: TransactionsForCustomersLoader.name,
    })
    transactionsForCustomerLoader: TransactionsDataLoader,
    @Loader({
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
  async paymentPlan(
    @Parent() customer,
    @Loader({
      type: PrismaLoader.name,
      generateParams: {
        query: `customers`,
        info: `{ 
          id
          plan 
        }`,
        formatData: a => a.plan,
      },
    })
    prismaLoader: PrismaDataLoader<any>,
    @Loader({
      type: PrismaLoader.name,
      generateParams: {
        formatWhere: (ids: string[]) => ({
          where: { planID_in: ids },
        }),
        query: `paymentPlans`,
        info: "FROM_CONTEXT",
        infoFragment: `fragment EnsurePlanID on PaymentPlan {planID}`,
        getKey: a => a.planID,
      },
    })
    paymentPlanLoader: PrismaDataLoader<PaymentPlan>
  ) {
    const plan = await prismaLoader.load(customer.id)
    if (!plan) {
      return null
    }
    const paymentPlan = await paymentPlanLoader.load(
      this.paymentService.prismaPlanToChargebeePlanId(plan)
    )
    return paymentPlan
  }

  @ResolveField()
  async invoices(
    @Parent() customer,
    @Loader({
      type: InvoicesForCustomersLoader.name,
    })
    invoicesLoader: InvoicesDataLoader,
    @Loader({
      type: TransactionsForCustomersLoader.name,
    })
    transactionsForCustomerLoader: TransactionsDataLoader,
    @Loader({
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
      type: PrismaLoader.name,
      generateParams: getUserIDGenerateParams,
    })
    userIdLoader: PrismaDataLoader<string>,
    @Loader({
      type: PrismaLoader.name,
      generateParams: { query: "users", info: "FROM_CONTEXT" },
    })
    userLoader: PrismaDataLoader<any>
  ) {
    const userId = await userIdLoader.load(customer.id)
    const user = await userLoader.load(userId)
    return user
  }
}
