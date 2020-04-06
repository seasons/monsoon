import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { AuthService } from "@modules/User/services/auth.service"
import { CustomerService } from "@modules/User/services/customer.service"
import { EmailService } from "@modules/Email/services/email.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { ErrorService } from "@modules/Error/services/error.service"

@Injectable()
export class UsersScheduledJobs {
  private readonly logger = new Logger(`Cron: ${UsersScheduledJobs.name}`)

  constructor(
    private readonly airtableService: AirtableService,
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndAuthorizeUsers() {
    this.logger.log("Check and Authorize Users job ran")
    let log = {
      updatedUsers: [],
      errors: [],
    }

    // Retrieve emails and statuses of every user on the airtable DB
    const allAirtableUsers = await this.airtableService.getAllUsers()
    for (const airtableUser of allAirtableUsers) {
      try {
        if (airtableUser.fields.Status === "Authorized") {
          const prismaUser = await this.prisma.client.user({
            email: airtableUser.model.email,
          })
          if (!!prismaUser) {
            this.errorService.setUserContext(prismaUser)

            const prismaCustomer = await this.authService.getCustomerFromUserID(
              prismaUser.id
            )
            const prismaCustomerStatus = await this.prisma.client
              .customer({ id: prismaCustomer.id })
              .status()

            if (prismaCustomerStatus !== "Authorized") {
              log.updatedUsers.push(prismaUser.email)
              this.customerService.setCustomerPrismaStatus(
                prismaUser,
                "Authorized"
              )
              this.emailService.sendAuthorizedToSubscribeEmail(prismaUser)
            }
          }
        }
      } catch (err) {
        this.errorService.captureError(err)
        log.errors.push(err)
      }
    }

    this.logger.log("Check and Authorize users results: ")
    this.logger.log(log)
  }
}
