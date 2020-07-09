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
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { head, isObject } from "lodash"

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
      params: getUserIDGenerateParams,
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
      params: {
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
      params: {
        formatWhere: (ids: string[]) => ({
          where: { planID_in: ids },
        }),
        query: `paymentPlans`,
        infoFragment: `fragment EnsurePlanID on PaymentPlan {planID}`,
        getKey: a => a.planID,
      },
      includeInfo: true,
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
      params: getUserIDGenerateParams,
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
      params: getUserIDGenerateParams,
    })
    userIdLoader: PrismaDataLoader<string>,
    @Loader({
      type: PrismaLoader.name,
      params: { query: "users" },
      includeInfo: true,
    })
    userLoader: PrismaDataLoader<any>
  ) {
    if (isObject(customer.user)) {
      return customer.user
    }
    const userId = await userIdLoader.load(customer.id)
    const user = await userLoader.load(userId)
    return user
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
