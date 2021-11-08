import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import sgMail from "@sendgrid/mail"
import chargebee from "chargebee"
import { Parser } from "json2csv"
import { head, isEmpty } from "lodash"
import moment from "moment"

@Injectable()
export class MarketingScheduledJobs {
  private readonly logger = new Logger(MarketingScheduledJobs.name)

  constructor(
    private readonly dripSync: DripSyncService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly admissions: AdmissionsService,
    private readonly sms: SMSService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCustomersToDrip() {
    this.logger.log("Run drip customers sync")
    const result = await this.dripSync.syncCustomersDifferential()
    this.logger.log(`Drip customers sync results: `)
    this.logger.log(result)
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async syncUnsubscribesFromDrip() {
    this.logger.log(`Run drip unsubscribe sync`)
    const count = await this.dripSync.syncUnsubscribesFromDrip()
    this.logger.log(`Drip Unsubscribe job unsubscribed ${count} users`)
  }

  // TODO: Update in lieue of deprecation of 7 day auth window
  @Cron(CronExpression.EVERY_6_HOURS)
  async authWindowFollowups() {
    this.logger.log("Run auth window followups job")
    const dayTwoFollowupsSent = []
    const customers = await this.prisma.client.customer.findMany({
      where: {
        AND: [
          // Prior to Jan 26 2021 we had some cases we need to handle manually
          {
            admissions: {
              authorizationWindowClosesAt: { gte: new Date(2021, 0, 26) },
            },
          },
          { status: "Authorized" },
        ],
      },
      select: {
        id: true,
        authorizedAt: true,
        admissions: { select: { authorizationWindowClosesAt: true } },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            emails: { select: { emailId: true } },
            smsReceipts: { select: { id: true, smsId: true } },
          },
        },
      },
    })
    for (const cust of customers) {
      const now = moment()
      const dayTwoStarted = moment(cust.authorizedAt)
        .add(1, "d")
        .isSameOrBefore(now)
      const receivedEmails = cust.user.emails.map(a => a.emailId)
      const dayTwoFollowupSent = receivedEmails.includes(
        "DayTwoAuthorizationFollowup"
      )

      // Send day 2 email if needed
      if (dayTwoStarted) {
        if (!dayTwoFollowupSent) {
          await this.email.sendAuthorizedDayTwoFollowup(cust.user)
          dayTwoFollowupsSent.push(cust.user.email)
        }
        continue
      }
    }
    this.logger.log("Auth window followups job finished")
    this.logger.log({
      dayTwoFollowupsSent,
    })
  }

  // TODO: Turn this back on once migration is done and we've
  // retooled this email.
  // @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async admissableBimonthlyNurture() {
    // Make sure we're doing it every 15 days only
    const todayDate = new Date().getDate()
    if (![1, 15].includes(todayDate)) {
      this.logger.log(
        `Not running admissable bimonthly nurture because day is ${todayDate}`
      )
      return
    }
    const waitlistedAdmissableCustomers = await this.prisma.client.customer.findMany(
      {
        where: {
          AND: [{ admissions: { admissable: true } }, { status: "Waitlisted" }],
        },
        select: {
          id: true,
          user: { select: { id: true, email: true, firstName: true } },
        },
      }
    )
    for (const cust of waitlistedAdmissableCustomers) {
      const availableStyles = await this.admissions.getAvailableStyles({
        id: cust.id,
      })
      await this.email.sendRecommendedItemsNurtureEmail(
        cust.user,
        availableStyles
      )
    }
  }

  private async getInitialSubscriptionAmount(prismaUserId) {
    const invoices = await chargebee["invoice"]
      .list({ "customer_id[in]": [prismaUserId] })
      .request()

    //@ts-ignore
    return head(invoices.list)?.invoice?.amount_paid / 100 || 10.0
  }
}
