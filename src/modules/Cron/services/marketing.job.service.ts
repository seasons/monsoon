import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import moment from "moment"

@Injectable()
export class MarketingScheduledJobs {
  private readonly logger = new Logger(MarketingScheduledJobs.name)

  constructor(
    private readonly dripSync: DripSyncService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly admissions: AdmissionsService,
    private readonly sms: SMSService
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncCustomersToDrip() {
    this.logger.log("Run drip sync")
    const result = await this.dripSync.syncCustomersDifferential()
    this.logger.log(`drip sync results: `)
    this.logger.log(result)
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async authWindowFollowups() {
    this.logger.log("Run auth window followups job")
    const twentyFourHourFollowupsSent = []
    const windowsClosed = []

    const customers = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            // october 5 is 2020 is when we started manually enforcing the auth window
            { user: { createdAt_gte: new Date(2020, 9, 5) } },
            { status: "Authorized" },
          ],
        },
      },
      `{
        id
        authorizedAt
        user {
          id
          email
          firstName
          emails {
            emailId
          }
        }
      }`
    )

    for (const cust of customers) {
      const now = moment()

      const twentyFoursPassed = moment(cust.authorizedAt)
        .add(1, "d")
        .isSameOrBefore(now)
      const windowClosed = moment(cust.authorizedAt)
        .add(2, "d")
        .isSameOrBefore(now)

      const receivedEmails = cust.user.emails.map(a => a.emailId)
      const rewaitlistEmailSent = receivedEmails.includes("Rewaitlisted")
      const twentyFourHourFollowupSent = receivedEmails.includes(
        "TwentyFourHourAuthorizationFollowup"
      )

      // Send rewaitlist email as needed
      if (windowClosed && !rewaitlistEmailSent) {
        const availableStyles = await this.admissions.getAvailableStyles({
          id: cust.id,
        })
        await this.email.sendRewaitlistedEmail(cust.user, availableStyles)
        await this.sms.sendSMSById({
          to: { id: cust.user.id },
          renderData: { name: cust.user.firstName },
          smsId: "Rewaitlisted",
        })
        await this.prisma.client.updateCustomer({
          where: { id: cust.id },
          data: { status: "Waitlisted" },
        })
        windowsClosed.push(cust.user.email)
        break
      }

      // Send 24 hour follow up email as needed
      if (twentyFoursPassed && !twentyFourHourFollowupSent) {
        const availableStyles = await this.admissions.getAvailableStyles({
          id: cust.id,
        })
        await this.email.sendAuthorized24HourFollowup(
          cust.user,
          availableStyles
        )
        await this.sms.sendSMSById({
          to: { id: cust.user.id },
          renderData: { name: cust.user.firstName },
          smsId: "TwentyFourHourAuthorizationFollowup",
        })
        twentyFourHourFollowupsSent.push(cust.user.email)
        break
      }
    }
    this.logger.log("Auth window followups job finished")
    this.logger.log({ twentyFourHourFollowupsSent, windowsClosed })
  }
}
