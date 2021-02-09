import { ErrorService } from "@app/modules/Error/services/error.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import chargebee from "chargebee"
import { head } from "lodash"
import { DateTime } from "luxon"

@Injectable()
export class SubscriptionsScheduledJobs {
  private readonly logger = new Logger(
    `Cron: ${SubscriptionsScheduledJobs.name}`
  )

  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateAdmissionsFields() {
    this.logger.log(`Start update subscriptions field job`)

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

      for (const subscription of allSubscriptions) {
        const userID = subscription.customer_id
        const customers = await this.prisma.binding.query.customers(
          {
            where: {
              user: { id: userID },
            },
          },
          `
          {
            id
            membership {
                id
                subscription {
                    id
                }
            }
          }
        `
        )
        const customer = head(customers)

        if (!customer) {
          console.log("error no customer")
          return
        }

        const data = {
          nextBillingAt: DateTime.fromSeconds(
            subscription.next_billing_at
          ).toISO(),
          currentTermEnd: DateTime.fromSeconds(
            subscription.current_term_end
          ).toISO(),
          currentTermStart: DateTime.fromSeconds(
            subscription.current_term_start
          ).toISO(),
          status: subscription.status,
          planPrice: subscription.plan_amount,
          subscriptionId: subscription.id,
          planID: subscription.plan_id,
        }

        const membershipSubscriptionID = customer?.membership?.subscription?.id
        if (membershipSubscriptionID) {
          await this.prisma.client.updateCustomerMembershipSubscriptionData({
            where: { id: membershipSubscriptionID },
            data,
          })
        } else {
          const membershipSubscription = (await this.prisma.client.createCustomerMembershipSubscriptionData(
            data
          )) as any

          await this.prisma.client.updateCustomerMembership({
            where: { id: customer.membership.id },
            data: {
              subscription: { connect: { id: membershipSubscription.id } },
            },
          })
        }
      }
    } catch (e) {
      console.log("e", e)
      this.error.captureError(e)
    }

    this.logger.log(`Finished update subscriptions field job`)
  }
}
