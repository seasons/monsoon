import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import moment from "moment"

const EVERY_15_DAYS_AT_6PM = "0 0 18 1,15 * ?"
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
    this.logger.log("Run drip customers sync")
    const result = await this.dripSync.syncCustomersDifferential()
    this.logger.log(`Drip customers sync results: `)
    this.logger.log(result)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncUnsubscribesFromDrip() {
    this.logger.log(`Run drip unsubscribe sync`)
    const count = await this.dripSync.syncUnsubscribesFromDrip()
    this.logger.log(`Drip Unsubscribe job unsucrbied ${count} users`)
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async authWindowFollowups() {
    this.logger.log("Run auth window followups job")
    const daySevenFollowupsSent = []
    const dayFiveFollowupsSent = []
    const dayThreeFollowupsSent = []
    const dayTwoFollowupsSent = []
    const windowsClosed = []

    const customers = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            // Prior to Jan 26 2021 we had some cases we need to handle manually
            {
              admissions: {
                authorizationWindowClosesAt_gte: new Date(2021, 0, 26),
              },
            },
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
          smsReceipts {
            id
            smsId
          }
        }
      }`
    )

    for (const cust of customers) {
      const now = moment()

      const dayTwoStarted = moment(cust.authorizedAt)
        .add(1, "d")
        .isSameOrBefore(now)
      const dayThreeStarted = moment(cust.authorizedAt)
        .add(2, "d")
        .isSameOrBefore(now)
      const dayFourStarted = moment(cust.authorizedAt)
        .add(3, "d")
        .isSameOrBefore(now)
      const dayFiveStarted = moment(cust.authorizedAt)
        .add(4, "d")
        .isSameOrBefore(now)
      const daySixStarted = moment(cust.authorizedAt)
        .add(5, "d")
        .isSameOrBefore(now)
      const daySevenStarted = moment(cust.authorizedAt)
        .add(6, "d")
        .isSameOrBefore(now)
      const windowClosed = moment(now).isAfter(
        cust.admissions?.authorizationWindowClosesAt
      )

      const receivedEmails = cust.user.emails.map(a => a.emailId)
      const receivedSMSs = cust.user.smsReceipts.map(a => a.smsId)
      const dayTwoFollowupSent = receivedEmails.includes(
        "DayTwoAuthorizationFollowup"
      )
      const dayThreeFollowupSent = receivedEmails.includes(
        "DayThreeAuthorizationFollowup"
      )
      const dayFourFollowupSent = receivedEmails.includes(
        "DayFourAuthorizationFollowup"
      )
      const dayFiveFollowupSent =
        receivedEmails.includes("DayFiveAuthorizationFollowup") ||
        receivedSMSs.includes("SeventyTwoHoursLeftAuthorizationFollowup")
      const daySixFollowupSent = receivedEmails.includes(
        "DaySixAuthorizationFollowup"
      )
      const daySevenFollowupSent =
        receivedEmails.includes("DaySevenAuthorizationFollowup") ||
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

      // Send day 7 email as needed
      if (daySevenStarted) {
        if (!daySevenFollowupSent) {
          const availableStyles = await this.admissions.getAvailableStyles({
            id: cust.id,
          })
          await this.email.sendAuthorizedDaySevenFollowup(
            cust.user,
            availableStyles
          )
          await this.sms.sendSMSById({
            to: { id: cust.user.id },
            renderData: { name: cust.user.firstName },
            smsId: "TwentyFourHourLeftAuthorizationFollowup",
          })
          daySevenFollowupsSent.push(cust.user.email)
        }
        continue
      }

      // Send day 6 email as needed
      if (daySixStarted) {
        if (!daySixFollowupSent) {
          // TODO: Send email
        }
        continue
      }

      // Send day 5 email if needed
      if (dayFiveStarted) {
        // TODO: Send email
        if (!dayFiveFollowupSent) {
          await this.sms.sendSMSById({
            to: { id: cust.user.id },
            renderData: { name: cust.user.firstName },
            smsId: "SeventyTwoHoursLeftAuthorizationFollowup",
          })
          dayFiveFollowupsSent.push(cust.user.email)
        }
        continue
      }

      // Send day 4 email if needed
      if (dayFourStarted) {
        // TODO: Send email
        if (!dayFourFollowupSent) {
        }
        continue
      }

      // Send day 3 email if needed
      if (dayThreeStarted) {
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
      dayThreeFollowupsSent,
      dayFiveFollowupsSent,
      daySevenFollowupsSent,
      windowsClosed,
    })
  }

  @Cron(EVERY_15_DAYS_AT_6PM)
  async admissableBimonthlyNurture() {
    const waitlistedAdmissableCustomers = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [{ admissions: { admissable: true } }, { status: "Waitlisted" }],
        },
      },
      `{
      id
      user {
        id
        email
        firstName
      }
    }`
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
}
