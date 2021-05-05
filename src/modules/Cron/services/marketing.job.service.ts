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

const EVERY_15_DAYS_AT_6PM = "0 0 18 5,20 * ?"
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
    // Just in case the cron expression is wrong, put a check
    // to make sure we're doing it on the 1st and 15th only!
    const todayDate = new Date().getDate()
    if (![5, 20].includes(todayDate)) {
      this.error.captureMessage(
        `Tried to run admissable bimonthly nurture on wrong day: ${todayDate}`
      )
      return
    }

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

  /*  
    Reference: https://docs.google.com/spreadsheets/d/1aAD5kDpGgYQfOwl7UBPRq8Q9jOiYej8EwXc2Z1t8ABU/edit?usp=sharing
    Reference: https://impact-helpdesk.freshdesk.com/support/solutions/articles/48001162591-submit-conversion-data-via-ftp-or-email
  */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncEventsToImpact() {
    const today = new Date()
    const CampaignId = 12888
    const AccountCreationActionTrackerId = 23949
    const AuthorizedUserActionTrackerId = 23950
    const InitialSubscriptionActionTrackerId = 23951
    const ImpactFileuploadEmail =
      "42f56e88-c6ae-41dc-9c16-3f9522edb3df@batch.impact.com"
    const oneDapperStreetMediaPartnerId = 183668
    const threadabilityMediaPartnerId = 2253589
    const faiyamRahmanMediaPartnerId = 2729780

    const customersToUpdate = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            // They came through a rev share partner but not through an impact link
            {
              detail: {
                discoveryReference_in: ["onedapperstreet", "threadability"],
                impactId: null,
              },
            },
            {
              OR: [
                // We need to upload their Account Creation action
                {
                  impactSyncTimings_none: {
                    AND: [{ type: "Impact" }, { detail: "AccountCreation" }],
                  },
                },
                // We need to upload their Authorized User action
                {
                  AND: [
                    { authorizedAt_not: null },
                    {
                      impactSyncTimings_none: {
                        AND: [{ type: "Impact" }, { detail: "AuthorizedUser" }],
                      },
                    },
                  ],
                },
                // We need to upload their Initial Subscription action
                {
                  AND: [
                    { admissions: { subscribedAt_not: null } },
                    {
                      impactSyncTimings_none: {
                        AND: [
                          { type: "Impact" },
                          { detail: "InitialSubscription" },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      `{
        id
        createdAt
        authorizedAt
        admissions {
          id
          subscribedAt
        }
        user {
          id
        }
        impactSyncTimings {
          type
          detail
        }
        detail {
          id
          discoveryReference
        }
      }`
    )

    const syncTimingUpdates = []
    const createSyncTimingUpdateFunc = (cust, detail) => async () =>
      this.prisma.client.updateCustomer({
        where: { id: cust.id },
        data: {
          impactSyncTimings: {
            create: {
              type: "Impact",
              detail,
              syncedAt: today,
            },
          },
        },
      })
    const generateOrderId = () =>
      Math.floor(Math.random() * 9000000000000) + 1000000000000
    const getMediaPartnerId = discoveryReference => {
      switch (discoveryReference) {
        case "onedapperstreet":
          return oneDapperStreetMediaPartnerId
        case "threadability":
          return threadabilityMediaPartnerId
        case "faiyamrahman": // tester
          return faiyamRahmanMediaPartnerId
      }
    }
    const createCommonFields = cust => ({
      CampaignId,
      CurrencyCode: "USD",
      OrderId: generateOrderId(),
      CustomerId: cust.user.id,
      MediaPartnerId: getMediaPartnerId(cust.detail.discoveryReference),
      Amount: 0.0,
    })

    const csvData = []
    for (const cust of customersToUpdate) {
      const impactSyncTimings = cust.impactSyncTimings.filter(
        a => a.type === "Impact"
      )
      const shouldUploadAccountCreation = isEmpty(
        impactSyncTimings.filter(a => a.detail === "AccountCreation")
      )
      const shouldUploadAuthorizedUser =
        isEmpty(impactSyncTimings.filter(a => a.detail === "AuthorizedUser")) &&
        !!cust.authorizedAt
      const shouldUploadInitialSubscription =
        isEmpty(
          impactSyncTimings.filter(a => a.detail === "InitialSubscription")
        ) && !!cust.admissions?.subscribedAt

      if (shouldUploadAccountCreation) {
        csvData.push({
          ...createCommonFields(cust),
          ActionTrackerId: AccountCreationActionTrackerId,
          EventDate: cust.createdAt,
        })
        syncTimingUpdates.push(
          createSyncTimingUpdateFunc(cust, "AccountCreation")
        )
      }
      if (shouldUploadAuthorizedUser) {
        csvData.push({
          ...createCommonFields(cust),
          ActionTrackerId: AuthorizedUserActionTrackerId,
          EventDate: cust.authorizedAt,
        })
        syncTimingUpdates.push(
          createSyncTimingUpdateFunc(cust, "AuthorizedUser")
        )
      }
      if (shouldUploadInitialSubscription) {
        const Amount = await this.getInitialSubscriptionAmount(cust.user.id)
        csvData.push({
          ...createCommonFields(cust),
          ActionTrackerId: InitialSubscriptionActionTrackerId,
          EventDate: cust.admissions.subscribedAt,
          Amount,
        })
        syncTimingUpdates.push(
          createSyncTimingUpdateFunc(cust, "InitialSubscription")
        )
      }
    }

    if (csvData.length === 0) {
      this.logger.log(`No events to sync`)
      return
    }

    const parser = new Parser({
      fields: [
        "CampaignId",
        "ActionTrackerId",
        "MediaPartnerId",
        "OrderId",
        "EventDate",
        "Amount",
        "CurrencyCode",
        "CustomerId",
      ],
    })
    const base64EncodedCSV = Buffer.from(
      parser.parse(csvData),
      "utf-8"
    ).toString("base64")
    const todayStringFormatted = `${
      today.getMonth() + 1
    }.${today.getDate()}.${today.getFullYear()}`
    const msg = {
      to: ImpactFileuploadEmail,
      from: "membership@seasons.nyc",
      cc: ["membership@seasons.nyc", "faiyam@seasons.nyc"],
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
      await Promise.all(syncTimingUpdates.map(a => a()))
    } catch (err) {
      this.error.captureError(err)
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
