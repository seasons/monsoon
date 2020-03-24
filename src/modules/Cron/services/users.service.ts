import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as Sentry from "@sentry/node"
import { AirtableService } from '../../Airtable/services/airtable.service'
import { PrismaClientService } from '../../../prisma/client.service'
import { AuthService } from '../../User/services/auth.service'
import { CustomerService } from '../../User/services/customer.service'
import { EmailService } from '../../Email/services/email.service'

@Injectable()
export class UsersScheduledJobs {
  private readonly logger = new Logger(`Cron: ${UsersScheduledJobs.name}`);

  constructor(
    private readonly airtableService: AirtableService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaClientService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndAuthorizeUsers() {
    this.logger.log("Check and Authorize Users job ran")
    const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"
    let log = {
      updated: [],
      usersInAirtableButNotPrisma: [],
    }
    try {
      // Retrieve emails and statuses of every user on the airtable DB
      let updatedUsers = []
      let usersInAirtableButNotPrisma = []
      const allAirtableUsers = await this.airtableService.getAllUsers()
      for (const airtableUser of allAirtableUsers) {
        if (airtableUser.fields.Status === "Authorized") {
          const prismaUser = await this.prisma.client.user({
            email: airtableUser.model.email,
          })
          if (!!prismaUser) {
            // Add user context on Sentry
            if (shouldReportErrorsToSentry) {
              Sentry.configureScope(scope => {
                scope.setUser({ id: prismaUser.id, email: prismaUser.email })
              })
            }

            const prismaCustomer = await this.authService.getCustomerFromUserID(
              prismaUser.id
            )
            const prismaCustomerStatus = await this.prisma.client
              .customer({ id: prismaCustomer.id })
              .status()
            if (prismaCustomerStatus !== "Authorized") {
              updatedUsers = [...updatedUsers, prismaUser.email]
              this.customerService.setCustomerPrismaStatus(prismaUser, "Authorized")
              this.emailService.sendAuthorizedToSubscribeEmail(prismaUser)
            }
          } else {
            usersInAirtableButNotPrisma = [
              ...usersInAirtableButNotPrisma,
              airtableUser.model.email,
            ]
          }
        }
      }
      log = {
        updated: updatedUsers,
        usersInAirtableButNotPrisma,
      }
    } catch (err) {
      if (shouldReportErrorsToSentry) {
        Sentry.captureException(err)
      }
    }

    if (log.updated.length + log.usersInAirtableButNotPrisma.length > 0) {
      this.logger.log(log)
    }
  }
  
}