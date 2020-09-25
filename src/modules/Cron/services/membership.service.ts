import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { PaymentService } from "@modules/Payment/index"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import * as Sentry from "@sentry/node"
import { head } from "lodash"
import { DateTime } from "luxon"

@Injectable()
export class MembershipScheduledJobs {
  private readonly logger = new Logger(`Cron: ${MembershipScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly payment: PaymentService,
    private readonly pushNotification: PushNotificationService
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
            const customer = this.prisma.client.pauseRequests({
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
            this.payment.resumeSubscription(subscriptionId, null, customer)
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
  async restartMembership() {
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

        await this.sendReminderPushNotification(
          customer,
          pauseRequest,
          resumeDate
        )

        if (!!pauseRequest && resumeDate <= DateTime.local()) {
          const customerWithMembership = (await this.prisma.binding.query.pauseRequest(
            { where: { id: pauseRequest.id } },
            `
              {
                id
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
          this.payment.resumeSubscription(subscriptionId, null, customer)
        }
      } catch (e) {
        Sentry.captureException(JSON.stringify(e))
      }
    }
  }

  async sendReminderPushNotification(customer, pauseRequest, resumeDate) {
    // Send reminder two days before customer membership is set to resume
    if (!!pauseRequest && resumeDate.minus({ days: 2 }) <= DateTime.local()) {
      const user = await this.prisma.client.customer({ id: customer.id }).user()

      const notificationID = "ResumeReminder"
      const notificationVars = {
        date: resumeDate,
      }

      // Check if push notification was sent before sending
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

      if (!pauseRequest.notified) {
        await this.prisma.client.updatePauseRequest({
          where: { id: pauseRequest.id },
          data: { notified: true },
        })

        await this.pushNotification.pushNotifyUser({
          email: user.email,
          pushNotifID: notificationID,
          vars: notificationVars,
        })
      }
    }
  }
}
