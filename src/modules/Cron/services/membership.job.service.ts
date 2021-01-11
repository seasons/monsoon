import { EmailService } from "@app/modules/Email/services/email.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import * as Sentry from "@sentry/node"
import { head } from "lodash"
import { DateTime } from "luxon"
import moment from "moment"

@Injectable()
export class MembershipScheduledJobs {
  private readonly logger = new Logger(`Cron: ${MembershipScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly payment: PaymentService,
    private readonly email: EmailService,
    private readonly sms: SMSService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async updatePausePendingToPaused() {
    const pauseRequests = await this.prisma.client.pauseRequests({
      where: {
        pausePending: true,
      },
    })

    for (const pauseRequest of pauseRequests) {
      try {
        if (DateTime.fromISO(pauseRequest.pauseDate) <= DateTime.local()) {
          const pauseRequestWithCustomer = (await this.prisma.binding.query.pauseRequest(
            { where: { id: pauseRequest.id } },
            `
              {
                id
                membership {
                  id
                  subscriptionId
                  customer {
                    id
                  }
                }
              }
            `
          )) as any

          const customerId = pauseRequestWithCustomer?.membership?.customer?.id

          const reservations = await this.prisma.client
            .customer({ id: customerId })
            .reservations({ orderBy: "createdAt_DESC" })

          const latestReservation = head(reservations)

          if (
            latestReservation &&
            !["Completed", "Cancelled"].includes(latestReservation.status)
          ) {
            const customer = await this.prisma.client.pauseRequests({
              where: {
                id: customerId,
              },
            })

            const subscriptionId =
              pauseRequestWithCustomer?.membership?.subscriptionId

            if (!subscriptionId) {
              return
            }

            // Customer has an active reservation so we restart membership
            await this.paymentUtils.resumeSubscription(
              subscriptionId,
              null,
              customer
            )
            this.logger.log(`Resumed customer subscription: ${customerId}`)
          } else {
            // Otherwise we can pause the membership if no active reservations
            await this.prisma.client.updatePauseRequest({
              where: { id: pauseRequest.id },
              data: { pausePending: false },
            })

            await this.prisma.client.updateCustomer({
              data: {
                status: "Paused",
              },
              where: { id: customerId },
            })
            this.logger.log(`Paused customer subscription: ${customerId}`)
          }
        }
      } catch (e) {
        Sentry.captureException(JSON.stringify(e))
      }
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async manageMembershipResumes() {
    const pausedCustomers = await this.prisma.client.customers({
      where: {
        status: "Paused",
      },
    })
    for (const customer of pausedCustomers) {
      try {
        const pauseRequests = await this.prisma.client.pauseRequests({
          where: {
            membership: {
              customer: {
                id: customer.id,
              },
            },
          },
          orderBy: "createdAt_DESC",
        })

        const pauseRequest = head(pauseRequests)
        const resumeDate = DateTime.fromISO(pauseRequest?.resumeDate)

        // If it's time to auto-resume, do so.
        if (!!pauseRequest && resumeDate <= DateTime.local()) {
          const customerWithMembership = (await this.prisma.binding.query.pauseRequest(
            { where: { id: pauseRequest.id } },
            `
              {
                id
                user {
                  id
                  firstName
                  lastName
                }
                membership {
                  id
                  subscriptionId
                }
              }
            `
          )) as any

          const subscriptionId =
            customerWithMembership?.membership?.subscriptionId

          if (!subscriptionId) {
            return
          }

          this.logger.log(`Paused customer subscription: ${customer.id}`)
          await this.paymentUtils.resumeSubscription(
            subscriptionId,
            null,
            customer
          )

          await this.email.sendResumeConfirmationEmail(
            customerWithMembership.user
          )
          continue
        }

        // If it's 2 days before their resume date, remind them.
        if (
          !!pauseRequest &&
          resumeDate.minus({ days: 2 }) <= DateTime.local()
        ) {
          await this.sendReminderComms(customer, pauseRequest)

          continue
        }
      } catch (e) {
        Sentry.captureException(JSON.stringify(e))
      }
    }
  }

  async sendReminderComms(customer, pauseRequest) {
    const user = await this.prisma.client.customer({ id: customer.id }).user()

    if (!pauseRequest.notified) {
      await this.sms.sendSMSById({
        to: { id: user.id },
        renderData: {
          name: user.firstName,
          resumeDate: moment(pauseRequest.resumeDate).format("dddd, MMMM Do"),
        },
        smsId: "ResumeReminder",
      })

      await this.email.sendResumeReminderEmail(user, pauseRequest.resumeDate)
      await this.prisma.client.updatePauseRequest({
        where: { id: pauseRequest.id },
        data: { notified: true },
      })
    }
  }
}
