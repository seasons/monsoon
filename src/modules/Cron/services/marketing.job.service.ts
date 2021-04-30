import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { AdmissionsService } from "@app/modules/User/services/admissions.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import sgMail from "@sendgrid/mail"
import { Parser } from "json2csv"
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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncEventsToImpact() {
    const CampaignId = 12888
    const AccountCreationActionTrackerId = 23949
    const AuthorizedUserActionTrackerId = 23950
    const InitialSubscriptionActionTrackerId = 23951

    // const ImpactFileuploadEmail =
    //   "42f56e88-c6ae-41dc-9c16-3f9522edb3df@batch.impact.com"
    const ImpactFileuploadEmail = "faiyam@faiyamrahman.com"

    const generateOrderId = () =>
      Math.floor(Math.random() * 9000000000000) + 1000000000000
    // Reference: https://docs.google.com/spreadsheets/d/1aAD5kDpGgYQfOwl7UBPRq8Q9jOiYej8EwXc2Z1t8ABU/edit?usp=sharing
    // Reference: https://impact-helpdesk.freshdesk.com/support/solutions/articles/48001162591-submit-conversion-data-via-ftp-or-email

    const parser = new Parser({
      fields: [
        "CampaignId",
        "ActionTrackerId",
        // "MediaPartnerId", // TODO: Fill this in on the data JSON
        "OrderId",
        "EventDate",
        "Amount",
        "CurrencyCode",
        "CustomerId",
      ],
    })
    const csvData = []

    const customersWhoCreatedAccounts = await this.prisma.binding.query.customers(
      {
        where: {
          detail: {
            discoveryReference_in: ["onedapperstreet", "threadability"],
            impactId: null,
          },
          impactSyncTimings_none: {
            AND: [{ type: "Impact" }, { detail: "AccountCreation" }],
          },
        },
      },
      `{
        id
        createdAt
        user {
          id
        }
      }`
    )
    for (const cust of customersWhoCreatedAccounts) {
      csvData.push({
        CampaignId,
        ActionTrackerId: AccountCreationActionTrackerId,
        OrderId: generateOrderId(),
        EventDate: cust.createdAt,
        Amount: 0.0,
        CurrencyCode: "USD",
        CustomerId: cust.user.id,
      })
    }

    const customersWhoBecameAuthorized = await this.prisma.binding.query.customers(
      {
        where: {
          detail: {
            discoveryReference_in: ["onedapperstreet", "threadability"],
            impactId: null,
          },
          authorizedAt_not: null,
          impactSyncTimings_none: {
            AND: [{ type: "Impact" }, { detail: "AuthorizedUser" }],
          },
        },
      },
      `{
        id
        authorizedAt
        user {
          id
        }
      }`
    )
    for (const cust of customersWhoBecameAuthorized) {
      csvData.push({
        CampaignId,
        ActionTrackerId: AuthorizedUserActionTrackerId,
        OrderId: generateOrderId(),
        EventDate: cust.authorizedAt,
        Amount: 0.0,
        CurrencyCode: "USD",
        CustomerId: cust.user.id,
      })
    }

    // Do the same for AuthorizedUser
    const customersWhoSubscribed = await this.prisma.binding.query.customers(
      {
        where: {
          detail: {
            discoveryReference_in: ["onedapperstreet", "threadability"],
            impactId: null,
          },
          admissions: { subscribedAt_not: null },
          impactSyncTimings_none: {
            AND: [{ type: "Impact" }, { detail: "InitialSubscription" }],
          },
        },
      },
      `{
        id
        admissions {
          id
          subscribedAt
        }
        user {
          id
        }
      }`
    )

    // Do the same for Initial Subscription
    for (const cust of customersWhoSubscribed) {
      const Amount = 10.0 // TODO: Query chargebee for amount
      csvData.push({
        CampaignId,
        ActionTrackerId: InitialSubscriptionActionTrackerId,
        OrderId: generateOrderId(),
        EventDate: cust.admissions.subscribedAt,
        Amount,
        CurrencyCode: "USD",
        CustomerId: cust.user.id,
      })
    }

    // TODO: Upload CSV to Impact
    if (csvData.length === 0) {
      // TODO: log something
      return
    }
    const base64EncodedCSV = Buffer.from(
      parser.parse(csvData),
      "utf-8"
    ).toString("base64")
    const today = new Date()
    const todayStringFormatted = `${
      today.getMonth() + 1
    }.${today.getDate()}.${today.getFullYear()}`
    const msg = {
      to: ImpactFileuploadEmail,
      from: "membership@seasons.nyc",
      subject: `${todayStringFormatted} Seasons Impact Extra Actions Upload`,
      text: "Thanks",
      attachments: [
        {
          content: base64EncodedCSV,
          filename: `${todayStringFormatted}SeasonsImpactExtraActionsUpload.csv`,
          type: "application/csv",
          disposition: "attachment",
        },
      ],
    }
    try {
      await sgMail.send(msg)
    } catch (err) {
      // TODO: Report to sentry
      console.log(err)
    }

    // TODO: If the csv upload is successful, update the impact sync timings on each customer
  }
}
