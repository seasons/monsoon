import { ErrorService } from "@app/modules/Error/services/error.service"
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
    private readonly paymentUtils: PaymentUtilsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateSubscriptionData() {
    this.logger.log(`Start update subscriptions field job`)

    let subscription
    let customer
    try {
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

      for (subscription of allSubscriptions) {
        const userID = subscription.customer_id
        const customer = await this.prisma.client.customer.findFirst({
          where: { user: { id: userID } },
          select: {
            id: true,
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

          const membershipSubscriptionID =
            customer?.membership?.subscription?.id
          if (membershipSubscriptionID) {
            await this.prisma.client.customerMembershipSubscriptionData.update({
              where: { id: membershipSubscriptionID },
              data,
            })
          } else {
            await this.prisma.client.customerMembershipSubscriptionData.create({
              data: {
                ...data,
                membership: { connect: { id: customer.membership.id } },
              },
            })
          }
        }
      }
    } catch (e) {
      console.log("e", e)
      this.error.setExtraContext(subscription, "subscription")
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
    }

    this.logger.log(`Finished update subscriptions field job`)
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleRentalInvoices() {
    /*
    Query all rental invoices whose billing ends today
      Bill them
      Create the customer's next rental invoice IF they are still active
    */
    const now = new Date()
    const invoicesToHandle = await this.prisma.client.rentalInvoice.findMany({
      where: {
        billingEndAt: {
          equals: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
        status: "Draft",
      },
      select: {
        id: true,
        membership: {
          select: { customer: { select: { status: true } }, id: true },
        },
      },
    })
    for (const invoice of invoicesToHandle) {
      // TODO: Bill it
      // TODO: Update the status

      // Create the next status if customer is still active
      // TODO: Update this to be a transaction once you also update the status
      if (
        ["Active", "PaymentFailed"].includes(invoice.membership.customer.status)
      ) {
        await this.paymentUtils.initDraftRentalInvoice(invoice.membership.id)
      }
    }
  }
}
