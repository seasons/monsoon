import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { EmailService } from "@app/modules/Email"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { head } from "lodash"
import moment from "moment"

@Injectable()
export class MarketingScheduledJobs {
  constructor(
    private readonly dripSync: DripSyncService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async syncCustomers() {
    await this.dripSync.syncCustomers()
  }

  async authWindowFollowups() {
    const customers = await this.prisma.binding.query.customers(
      {
        where: {
          AND: [
            { user: { createdAt_gte: new Date(2020, 9, 5) } },
            { status: "Authorized" },
          ],
        },
      },
      `{
        id
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
      const completeAccountReceipt = head(
        cust.user.emails.filter(a => a.emailId === "CompleteAccount")
      )
      const authorizedAt = completeAccountReceipt.createdAt
      const receivedEmails = cust.user.emails.map(a => a.emailId)
      const now = moment()

      // Send rewaitlist email as needed
      const deadlinePassed = moment(authorizedAt).add(2, "d").isAfter(now)
      const rewaitlistEmailSent = receivedEmails.includes("Rewaitlisted")
      if (deadlinePassed && !rewaitlistEmailSent) {
        await this.email.sendRewaitlistedEmail(cust.user)
        // TODO: Send text message
        break
      }

      // Send 24 hour follow up email as needed
      const twentyFoursPassed = moment(authorizedAt).add(1, "d").isAfter(now)
      const twentyFourHourFollowupSent = receivedEmails.includes(
        "TwentyFourHourAuthorizationFollowup"
      )
      if (twentyFoursPassed && !twentyFourHourFollowupSent) {
        await this.email.sendAuthorized24HourFollowup(cust.user)
        // TODO: Send text message
        break
      }
    }
  }
}
