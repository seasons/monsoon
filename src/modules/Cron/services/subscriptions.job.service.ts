import { ErrorService } from "@app/modules/Error/services/error.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { CustomerService } from "@app/modules/User/services/customer.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import chargebee from "chargebee"
import { DateTime } from "luxon"

@Injectable()
export class SubscriptionsScheduledJobs {
  private readonly logger = new Logger(
    `Cron: ${SubscriptionsScheduledJobs.name}`
  )

  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService,
    private readonly customer: CustomerService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateAdmissionsFields() {
    this.logger.log(`Start update subscriptions field job`)

    const subscriptionList = chargebee.subscription.list().request()

    this.logger.log(`Finished update subscriptions field job`)
  }
}

// @Resolver("CustomerMembership")
// export class CustomerMembershipFieldsResolver {
//   constructor() {}

//   @ResolveField()
//   async subscription(@Parent() membership: CustomerMembership) {
//     const subscriptionID = membership.subscriptionId

//     const request = await chargebee.subscription
//       .retrieve(subscriptionID)
//       .request()

//     const subscription = request?.subscription

//     return {
//         id:
//       nextBillingAt: DateTime.fromSeconds(subscription.next_billing_at).toISO(),
//       currentTermEnd: DateTime.fromSeconds(
//         subscription.current_term_end
//       ).toISO(),
//       currentTermStart: DateTime.fromSeconds(
//         subscription.current_term_start
//       ).toISO(),
//       status: subscription.status,
//       planPrice: subscription.plan_amount,
//       subscriptionId: subscription.id,
//       planID: subscription.plan_id,
//     }
//   }
// }
