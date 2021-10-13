import { ErrorService } from "@app/modules/Error/services/error.service"
import { AccessPlanID } from "@app/modules/Payment/payment.types"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import chargebee from "chargebee"

@Injectable()
export class SubscriptionsScheduledJobs {
  private readonly logger = new Logger(
    `Cron: ${SubscriptionsScheduledJobs.name}`
  )

  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly rental: RentalService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateSubscriptionData() {
    this.logger.log(`Start update subscriptions field job`)

    const allSubscriptions = []

    let offset = "start"
    while (true) {
      let list
      ;({ next_offset: offset, list } = await chargebee.subscription
        .list({
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request())
      allSubscriptions.push(...list?.map(a => a.subscription))
      if (!offset) {
        break
      }
    }

    let subscription
    let customer
    let i = 0
    const total = allSubscriptions.length
    for (subscription of allSubscriptions) {
      i++
      if (i % 5 === 0) {
        console.log(`Syncing subscription ${i} of ${total}`)
      }
      try {
        const userID = subscription.customer_id
        if (!userID) {
          throw "subscription missing customer id"
        }
        customer = await this.prisma.client.customer.findFirst({
          where: { user: { id: userID } },
          select: {
            id: true,
            user: { select: { id: true, email: true } },
            membership: {
              select: { id: true, subscription: { select: { id: true } } },
            },
          },
        })

        if (!customer) {
          console.log("error no customer")
        } else {
          const data = this.paymentUtils.getCustomerMembershipSubscriptionData(
            subscription
          )

          let grandfatheredPayload = data?.planID?.includes("access")
            ? { grandfathered: false }
            : {}

          await this.prisma.client.customerMembership.upsert({
            where: { id: customer.membership?.id || "" },
            create: {
              subscriptionId: data.subscriptionId,
              customer: { connect: { id: customer.id } },
              plan: { connect: { planID: data.planID } },
              subscription: { create: data },
              ...grandfatheredPayload,
            },
            update: {
              subscriptionId: data.subscriptionId,
              plan: { connect: { planID: data.planID } },
              subscription: { upsert: { create: data, update: data } },
              ...grandfatheredPayload,
            },
          })
        }
      } catch (e) {
        console.log("e", e)
        this.error.setExtraContext(subscription, "subscription")
        this.error.setExtraContext(customer, "customer")
        this.error.captureError(e)
      }
    }

    this.logger.log(`Finished update subscriptions field job`)
  }
}
