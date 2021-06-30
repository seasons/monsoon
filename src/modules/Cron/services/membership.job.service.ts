import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { SMSService } from "@app/modules/SMS/services/sms.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
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
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async updatePausePendingToPaused() {
    const pauseRequests = await this.prisma.client2.pauseRequest.findMany({
      where: {
        AND: [
          {
            pausePending: true,
          },
          { membership: { id: { not: undefined } } },
        ],
      },
    })

    for (const pauseRequest of pauseRequests) {
      let pauseRequestWithCustomer = null
      let latestReservation = null
      try {
        if (
          DateTime.fromISO((pauseRequest.pauseDate as unknown) as string) <=
          DateTime.local()
        ) {
          pauseRequestWithCustomer = await this.prisma.client2.pauseRequest.findUnique(
            {
              where: { id: pauseRequest.id },
              select: {
                id: true,
                membership: {
                  select: {
                    id: true,
                    subscriptionId: true,
                    customer: { select: { id: true } },
                    plan: { select: { id: true, itemCount: true } },
                  },
                },
              },
            }
          )
          pauseRequestWithCustomer = this.prisma.sanitizePayload(
            pauseRequestWithCustomer,
            "PauseRequest"
          )

          const customerId = pauseRequestWithCustomer?.membership?.customer?.id

          if (pauseRequest.pauseType === "WithItems") {
            const planID = this.utils.getPauseWithItemsPlanId(
              pauseRequestWithCustomer?.membership
            )

            await chargebee.subscription
              .update(pauseRequestWithCustomer.membership.subscriptionId, {
                plan_id: planID,
              })
              .request()

            await this.prisma.client2.customer.update({
              where: { id: customerId },
              data: {
                status: "Paused",
                membership: {
                  update: {
                    plan: { connect: { planID } },
                    pauseRequests: {
                      update: {
                        where: { id: pauseRequest.id },
                        data: { pausePending: false },
                      },
                    },
                  },
                },
              },
            })

            this.logger.log(
              `Paused customer subscription with items: ${customerId}`
            )
          } else {
            const reservedBagItemsCount = await this.prisma.client2.bagItem.count(
              {
                where: { customer: { id: customerId }, status: "Reserved" },
              }
            )

            if (reservedBagItemsCount > 0) {
              const subscriptionId =
                pauseRequestWithCustomer?.membership?.subscriptionId

              if (!subscriptionId) {
                return
              }

              // Customer has reserved pieces so we restart membership
              await this.paymentUtils.resumeSubscription(subscriptionId, null, {
                id: customerId,
              })
              this.logger.log(`Resumed customer subscription: ${customerId}`)
            } else {
              // Otherwise we can pause the membership if no reserved pieces
              await this.prisma.client2.customer.update({
                data: {
                  status: "Paused",
                  membership: {
                    update: {
                      pauseRequests: {
                        update: {
                          where: { id: pauseRequest.id },
                          data: { pausePending: false },
                        },
                      },
                    },
                  },
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

  // TODO: Convert to prismaTwo
  @Cron(CronExpression.EVERY_6_HOURS)
  async manageMembershipResumes() {
    const _pausedCustomers = await this.prisma.client2.customer.findMany({
      where: {
        status: "Paused",
      },
      select: {
        id: true,
        status: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        membership: {
          select: {
            id: true,
            subscriptionId: true,
            pauseRequests: {
              select: {
                id: true,
                createdAt: true,
                resumeDate: true,
                pausePending: true,
                notified: true,
              },
            },
          },
        },
      },
    })
    const pausedCustomers = this.prisma.sanitizePayload(
      _pausedCustomers,
      "Customer"
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
      await this.prisma.client2.pauseRequest.update({
        where: { id: pauseRequest.id },
        data: { notified: true },
      })
    }
  }
}
