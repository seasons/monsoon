import { Customer } from "@app/decorators"
import { TransactionsForCustomersLoader } from "@app/modules/Payment/loaders/transactionsForCustomers.loader"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Loader } from "@modules/DataLoader"
import {
  InvoicesForCustomersLoader,
  PaymentService,
} from "@modules/Payment/index"
import {
  InvoicesDataLoader,
  TransactionsDataLoader,
} from "@modules/Payment/payment.types"
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

  @Cron(CronExpression.EVERY_MINUTE)
  async updatePausePendingToPaused(
    @Customer() customer,
    @Loader(InvoicesForCustomersLoader.name) invoicesLoader: InvoicesDataLoader,
    @Loader(TransactionsForCustomersLoader.name)
    transactionsForCustomerLoader: TransactionsDataLoader
  ) {
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

        const invoices = this.paymentService.getCustomerInvoiceHistory(
          await this.prisma.client
            .customer({
              id: customerId,
            })
            .user()
            .id(),
          invoicesLoader,
          transactionsForCustomerLoader
        )

        const reservations = await this.prisma.client
          .customer({ id: customerId })
          .reservations({ orderBy: "createdAt_DESC" })

        const latestReservation = head(reservations)

        if (
          latestReservation &&
          !["Completed", "Cancelled"].includes(latestReservation.status)
        ) {
          // Customer has an active reservation so we restart membership
          const subscriptionId = invoices?.[0]?.subscriptionId

          this.paymentService.resumeSubscription(subscriptionId, null, customer)
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
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async restartMembership(
    @Loader(InvoicesForCustomersLoader.name) invoicesLoader: InvoicesDataLoader,
    @Loader(TransactionsForCustomersLoader.name)
    transactionsForCustomerLoader: TransactionsDataLoader
  ) {
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
        const invoices = this.paymentService.getCustomerInvoiceHistory(
          await this.prisma.client
            .customer({
              id: customer.id,
            })
            .user()
            .id(),
          invoicesLoader,
          transactionsForCustomerLoader
        )

        const subscriptionId = invoices?.[0]?.subscriptionId

        this.paymentService.resumeSubscription(subscriptionId, null, customer)
      }
    }
  }
}
