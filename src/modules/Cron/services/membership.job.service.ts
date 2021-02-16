import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
import { head } from "lodash"
import { DateTime } from "luxon"
import moment from "moment"

@Injectable()
export class MembershipScheduledJobs {
  private readonly logger = new Logger(`Cron: ${MembershipScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly email: EmailService,
    private readonly sms: SMSService,
    private readonly utils: UtilsService,
    private readonly statements: StatementsService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async updatePausePendingToPaused() {
    const pauseRequests = await this.prisma.client.pauseRequests({
      where: {
        AND: [
          {
            pausePending: true,
          },
          { membership: { id_not: null } },
        ],
      },
    })

    for (const pauseRequest of pauseRequests) {
      let pauseRequestWithCustomer = null
      let latestReservation = null
      try {
        if (DateTime.fromISO(pauseRequest.pauseDate) <= DateTime.local()) {
          pauseRequestWithCustomer = (await this.prisma.binding.query.pauseRequest(
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
                  plan {
                    id
                    itemCount
                  }
                }
              }
            `
          )) as any

          const customerId = pauseRequestWithCustomer?.membership?.customer?.id

          if (pauseRequest.pauseType === "WithItems") {
            const itemCount =
              pauseRequestWithCustomer?.membership?.plan?.itemCount
            let planID
            if (itemCount === 1) {
              planID = "pause-1"
            } else if (itemCount === 2) {
              planID = "pause-2"
            } else if (itemCount === 3) {
              planID = "pause-3"
            }

            await chargebee.subscription
              .update(pauseRequestWithCustomer.membership.subscriptionId, {
                plan_id: planID,
              })
              .request()

            await this.prisma.client.updatePauseRequest({
              where: { id: pauseRequest.id },
              data: { pausePending: false },
            })

            await this.prisma.client.updateCustomerMembership({
              where: { id: pauseRequestWithCustomer.membership.id },
              data: {
                plan: { connect: { planID } },
              },
            })

            await this.prisma.client.updateCustomer({
              data: {
                status: "Paused",
              },
              where: { id: customerId },
            })

            this.logger.log(
              `Paused customer subscription with items: ${customerId}`
            )
          } else {
            const reservations = await this.prisma.client
              .customer({ id: customerId })
              .reservations({ orderBy: "createdAt_DESC" })

            latestReservation = head(reservations)

            if (this.statements.reservationIsActive(latestReservation)) {
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
              this.logger.log(
                `Paused customer subscription without items: ${customerId}`
              )
            }
          }
        }
      } catch (e) {
        this.error.setExtraContext({ pauseRequestWithCustomer }, "pauseRequest")
        this.error.setExtraContext({ latestReservation }, "latestReservation")
        this.error.captureError(e)
      }
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async manageMembershipResumes() {
    const pausedCustomers = await this.prisma.binding.query.customers(
      {
        where: {
          status: "Paused",
        },
      },
      `{
      id
      status
      user {
        id
        email
        firstName
        lastName
      }
      membership {
        id
        subscriptionId
        pauseRequests {
          id
          createdAt
          resumeDate
          pausePending
          notified
        }
      }
    }`
    )
    for (const customer of pausedCustomers) {
      try {
        const pauseRequest = this.utils.getLatestPauseRequest(customer)
        const resumeDate = DateTime.fromISO(pauseRequest?.resumeDate)

        // If it's time to auto-resume, do so.
        if (!!pauseRequest && resumeDate <= DateTime.local()) {
          const subscriptionId = customer.membership.subscriptionId
          if (!subscriptionId) {
            return
          }
          await this.paymentUtils.resumeSubscription(
            subscriptionId,
            null,
            customer
          )

          await this.email.sendResumeConfirmationEmail(customer.user)
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
        this.logger.log(e)
        Sentry.captureException(JSON.stringify(e))
      }
    }
  }

  async sendReminderComms(customer, pauseRequest) {
    if (!pauseRequest.notified) {
      await this.sms.sendSMSById({
        to: { id: customer.user.id },
        renderData: {
          name: customer.user.firstName,
          resumeDate: moment(pauseRequest.resumeDate).format("dddd, MMMM Do"),
        },
        smsId: "ResumeReminder",
      })

      await this.email.sendResumeReminderEmail(
        customer.user,
        pauseRequest.resumeDate
      )
      await this.prisma.client.updatePauseRequest({
        where: { id: pauseRequest.id },
        data: { notified: true },
      })
    }
  }
}
