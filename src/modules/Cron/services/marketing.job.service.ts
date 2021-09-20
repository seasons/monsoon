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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
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
    const customersToUpdate = await this.prisma.client.customer.findMany({
      where: {
        AND: [
          // They came through a rev share partner but not through an impact link
          {
            detail: {
              discoveryReference: { in: ["onedapperstreet", "threadability"] },
              impactId: null,
            },
          },
          {
            OR: [
              // We need to upload their Account Creation action
              {
                impactSyncTimings: {
                  none: {
                    AND: [{ type: "Impact" }, { detail: "AccountCreation" }],
                  },
                },
              },
              // We need to upload their Authorized User action
              {
                AND: [
                  { authorizedAt: { not: undefined } },
                  {
                    impactSyncTimings: {
                      none: {
                        AND: [{ type: "Impact" }, { detail: "AuthorizedUser" }],
                      },
                    },
                  },
                ],
              },
              // We need to upload their Initial Subscription action
              {
                AND: [
                  { admissions: { subscribedAt: { not: undefined } } },
                  {
                    impactSyncTimings: {
                      none: {
                        AND: [
                          { type: "Impact" },
                          { detail: "InitialSubscription" },
                        ],
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        authorizedAt: true,
        admissions: { select: { id: true, subscribedAt: true } },
        user: { select: { id: true } },
        impactSyncTimings: { select: { type: true, detail: true } },
        detail: { select: { id: true, discoveryReference: true } },
      },
    })
    const syncTimingUpdates = []
    const createSyncTimingUpdateFunc = (cust, detail) => async () =>
      this.prisma.client.customer.update({
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
      const impactSyncTimings = (cust as any).impactSyncTimings.filter(
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
        ) && !!(cust as any).admissions?.subscribedAt
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
        const Amount = await this.getInitialSubscriptionAmount(
          (cust as any).user.id
        )
        csvData.push({
          ...createCommonFields(cust),
          ActionTrackerId: InitialSubscriptionActionTrackerId,
          EventDate: (cust as any).admissions.subscribedAt,
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
