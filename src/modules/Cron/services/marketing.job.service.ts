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
      const twentyFourHoursLeft = moment(
        cust.admissions?.authorizationWindowClosesAt
      )
        .subtract(1, "d")
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
      const daySixFollowupSent = receivedEmails.includes(
        "DaySixAuthorizationFollowup"
      )
      const rewaitlistEmailSent = receivedEmails.includes("Rewaitlisted")

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

      // Send 24 hour followup (day 6) email as needed
      if (twentyFourHoursLeft && !daySixFollowupSent) {
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

      // Send day 5 email if needed
      if (fourDaysPassed && !dayFiveFollowupSent) {
        // TODO: Send email
        break
      }

      // Send day 4 email if needed
      if (threeDaysPassed && !dayFourFollowupSent) {
        // TODO: Send email
        break
      }

      // Send day 3 email if needed
      if (twoDaysPassed && !dayThreeFollowupSent) {
        const availableStyles = await this.admissions.getAvailableStyles({
          id: cust.id,
        })
        await this.email.sendAuthorizedDayThreeFollowup(
          cust.user,
          availableStyles
        )
        break
      }

      // Send day 2 email if needed
      if (oneDayPassed && !dayTwoFollowupSent) {
        // TODO: Send email
        break
      }
    }
    this.logger.log("Auth window followups job finished")
    this.logger.log({ twentyFourHourFollowupsSent, windowsClosed })
  }
}
