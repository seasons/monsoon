import { Customer } from "@app/decorators"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { PaymentService } from "@modules/Payment/services/payment.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { head } from "lodash"
import { DateTime } from "luxon"

@Injectable()
export class MembershipScheduledJobs {
  private readonly logger = new Logger(`Cron: ${MembershipScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async updatePausePendingToPaused(@Customer() customer) {
    this.logger.log("Update pause pending to paused job ran")

    const pauseRequests = await this.prisma.client.pauseRequests({
      where: {
        pausePending: true,
      },
    })

    for (const pauseRequest of pauseRequests) {
      if (DateTime.fromISO(pauseRequest.pauseDate) >= DateTime.local()) {
        const pauseRequestWithCustomer = (await this.prisma.binding.query.pauseRequest(
          { where: { id: pauseRequest.id } },
          `
            {
              id
              membership {
                id
                customer {
                  id
                }
              }
            }
          `
        )) as any

        const customerId = pauseRequestWithCustomer?.membership?.customer?.id

        const customerWithActiveReservation = (await this.prisma.binding.query.customer(
          { where: { id: customerId } },
          `
            {
              id
              activeReservation {
                id
              }
              invoices {
                id
                subscriptionId
              }
            }
          `
        )) as any

        if (customerWithActiveReservation?.activeReservation) {
          const subscriptionId =
            customerWithActiveReservation?.invoices?.[0]?.subscriptionId

          this.paymentService.resumeSubscription(subscriptionId, null, customer)
        } else {
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
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async restartMembership() {
    this.logger.log("Restart membership job ran")

    const pausedCustomers = await this.prisma.client.customers({
      where: {
        status: "Paused",
      },
    })

    for (const customer of pausedCustomers) {
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

      if (
        !!pauseRequest &&
        DateTime.fromISO(pauseRequest?.resumeDate) >= DateTime.local()
      ) {
        const customerWithInvoices = (await this.prisma.binding.query.customer(
          { where: { id: customer.id } },
          `
            {
              id
              invoices {
                id
                subscriptionId
              }
            }
          `
        )) as any

        const subscriptionId =
          customerWithInvoices?.invoices?.[0]?.subscriptionId

        this.paymentService.resumeSubscription(subscriptionId, null, customer)
      }
    }
  }
}
