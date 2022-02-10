import { WinstonLogger } from "@app/lib/logger"
import {
  ProcessableRentalInvoiceArgs,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import chargebee from "chargebee"

@Injectable()
export class BillingScheduledJobs {
  private readonly logger = (new Logger(
    `Cron: ${BillingScheduledJobs.name}`
  ) as unknown) as WinstonLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly rental: RentalService
  ) {}

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  @Cron(CronExpression.EVERY_HOUR)
  async stopBilling() {
    const allActiveSubs = []
    let offset = "start"
    while (true) {
      let list
      ;({ next_offset: offset, list } = await chargebee.subscription
        .list({
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
          "status[is]": "active",
        })
        .request())
      allActiveSubs.push(...list?.map(a => a.subscription))
      if (!offset) {
        break
      }
    }

    const numActiveSubs = allActiveSubs.length
    let i = 0
    for (const sub of allActiveSubs) {
      console.log(`${i++}/${numActiveSubs}`)
      const chargebeeCustId = sub.customer_id
      const cust = await this.prisma.client.customer.findFirst({
        where: { user: { id: chargebeeCustId } },
        select: {
          bagItems: { where: { status: "Reserved" }, select: { id: true } },
        },
      })
      if (!cust) {
        throw new Error(`no customer found for ${chargebeeCustId}`)
      }
      const hasNoReservedItems = cust.bagItems.length === 0
      if (hasNoReservedItems) {
        await chargebee.subscription
          .cancel(sub.id, {
            end_of_term: true,
          })
          .request((err, result) => {
            if (err) {
              return err
            }
            if (result) {
              return result
            }
          })
        await this.sleep(100)
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async updateCurrentBalanceOnCustomers() {
    const customers = await this.prisma.client.customer.findMany({
      where: {
        status: "Active",
      },
    })

    this.logger.log(
      `Start update current balance on ${customers.length} customers`
    )

    let i = 1
    for (const customer of customers) {
      try {
        await this.prisma.client.customer.update({
          where: {
            id: customer.id,
          },
          data: {
            membership: {
              update: {
                currentBalance: await this.rental.calculateCurrentBalance(
                  customer.id,
                  { upTo: "today" }
                ),
              },
            },
          },
        })

        this.logger.log(
          `Done setting current balance on customer ${i++} of ${
            customers.length
          }`,
          {
            customer,
          }
        )
      } catch (err) {
        this.logger.error(`Error while setting current balance on customer`, {
          customer,
          error: err,
        })
      }
    }

    this.logger.log(
      `End update current balance on ${customers.length} customers`
    )
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateEstimatedTotalOnInvoices() {
    const invoices = await this.prisma.client.rentalInvoice.findMany({
      where: {
        status: "Draft",
      },
      select: {
        id: true,
        membership: {
          select: {
            customerId: true,
          },
        },
      },
    })

    this.logger.log(`Updating ${invoices.length} invoices`)

    for (let invoice of invoices) {
      try {
        const [estimatedTotal] = await this.rental.updateEstimatedTotal(invoice)

        this.logger.log(
          `Updated estimated total on ${invoice.id}: ${(
            estimatedTotal / 100
          ).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}`,
          {
            estimatedTotal,
            invoice,
          }
        )
      } catch (e) {
        this.logger.error(
          `Error while updating estimated total on invoice ${invoice.id}`,
          {
            invoice,
            error: e,
          }
        )
      }
    }

    this.logger.log(`Done updating invoices`)
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleRentalInvoices() {
    this.logger.log(`Start handle rental invoices job`)

    let invoicesHandled = 0
    const invoicesToHandle = await this.prisma.client.rentalInvoice.findMany({
      where: {
        billingEndAt: {
          lte: new Date(),
        },
        status: { in: ["Draft", "ChargeFailed"] },
      },
      select: ProcessableRentalInvoiceArgs.select,
    })

    for (const invoice of invoicesToHandle) {
      invoicesHandled++
      await this.rental.processInvoice(invoice, {
        onError: err => {
          this.logger.error("Rental invoice billing failed", {
            invoice,
            error: err,
          })
        },
      })
    }

    this.logger.log(
      `End handle rental invoices job: ${invoicesHandled} invoices handled`
    )
  }
}
