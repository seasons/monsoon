import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email/services/email.service"
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
    const daySixFollowupsSent = []
    const dayThreeFollowupsSent = []
    const dayTwoFollowupsSent = []
    const windowsClosed = []

    const customers = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            // Prior to Jan 18 2021 we had some cases we need to handle manually
            { user: { createdAt_gte: new Date(2021, 0, 19) } },
            { status: "Authorized" },
          ],
        },
      },
      `{
        id
        authorizedAt
        admissions {
          authorizationWindowClosesAt
        }
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

      const oneDayPassed = moment(cust.authorizedAt)
        .add(1, "d")
        .isSameOrBefore(now)
      const twoDaysPassed = moment(cust.authorizedAt)
        .add(2, "d")
        .isSameOrBefore(now)
      const threeDaysPassed = moment(cust.authorizedAt)
        .add(3, "d")
        .isSameOrBefore(now)
      const fourDaysPassed = moment(cust.authorizedAt)
        .add(4, "d")
        .isSameOrBefore(now)
      const fiveDaysPassed = moment(cust.authorizedAt)
        .add(5, "d")
        .isSameOrBefore(now)
      const windowClosed = moment(now).isAfter(
        cust.admissions?.authorizationWindowClosesAt
      )

      const receivedEmails = cust.user.emails.map(a => a.emailId)
      const dayTwoFollowupSent = receivedEmails.includes(
        "DayTwoAuthorizationFollowup"
      )
      const dayThreeFollowupSent = receivedEmails.includes(
        "DayThreeAuthorizationFollowup"
      )
      const dayFourFollowupSent = receivedEmails.includes(
        "DayFourAuthorizationFollowup"
      )
      const dayFiveFollowupSent = receivedEmails.includes(
        "DayFiveAuthorizationFollowup"
      )
      const daySixFollowupSent =
        receivedEmails.includes("DaySixAuthorizationFollowup") ||
        receivedEmails.includes("TwentyFourHourAuthorizationFollowup") // previous, deprecated email id. Maintain for backwards compatibility.

      const rewaitlistEmailSent = receivedEmails.includes("Rewaitlisted")

      // Send rewaitlist email as needed
      if (windowClosed) {
        if (!rewaitlistEmailSent) {
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
        }
        continue
      }

      // Send day 6 email as needed
      if (fiveDaysPassed) {
        if (!daySixFollowupSent) {
          const availableStyles = await this.admissions.getAvailableStyles({
            id: cust.id,
          })
          await this.email.sendAuthorizedDaySixFollowup(
            cust.user,
            availableStyles
          )
          await this.sms.sendSMSById({
            to: { id: cust.user.id },
            renderData: { name: cust.user.firstName },
            smsId: "TwentyFourHourLeftAuthorizationFollowup",
          })
          daySixFollowupsSent.push(cust.user.email)
        }
        continue
      }

      // Send day 5 email if needed
      if (fourDaysPassed) {
        // TODO: Send email
        if (!dayFiveFollowupSent) {
        }
        continue
      }

      // Send day 4 email if needed
      if (threeDaysPassed) {
        // TODO: Send email
        if (!dayFourFollowupSent) {
        }
        continue
      }

      // Send day 3 email if needed
      if (twoDaysPassed) {
        if (!dayThreeFollowupSent) {
          const availableStyles = await this.admissions.getAvailableStyles({
            id: cust.id,
          })
          await this.email.sendAuthorizedDayThreeFollowup(
            cust.user,
            availableStyles
          )
          dayThreeFollowupsSent.push(cust.user.email)
        }
        continue
      }

      // Send day 2 email if needed
      if (oneDayPassed) {
        if (!dayTwoFollowupSent) {
          await this.email.sendAuthorizedDayTwoFollowup(cust.user)
          dayTwoFollowupsSent.push(cust.user.email)
        }
        continue
      }
    }
    this.logger.log("Auth window followups job finished")
    this.logger.log({
      dayThreeFollowupsSent,
      daySixFollowupsSent,
      windowsClosed,
    })
  }
}
