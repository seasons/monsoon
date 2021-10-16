import { WinstonLogger } from "@app/lib/logger"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { AccessPlanID } from "@app/modules/Payment/payment.types"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class BillingScheduledJobs {
  private readonly logger = (new Logger(
    `Cron: ${BillingScheduledJobs.name}`
  ) as unknown) as WinstonLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly rental: RentalService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
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

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
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
          `Updated invoice ${invoice.id}, estimated total: ${(
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
        this.logger.error(`Error while updating invoice ${invoice.id}`, e)
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
        id: "cktt7znfl11649rduv03byh1fn",
      },
      select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
    })

    for (const invoice of invoicesToHandle) {
      invoicesHandled++
      await this.rental.processInvoice(invoice, err => {
        this.error.setExtraContext(invoice)
        this.error.captureError(err)
        this.logger.error("Rental invoice billing failed", {
          invoice,
          error: err,
        })
      })
    }

    this.logger.log(
      `End handle rental invoices job: ${invoicesHandled} invoices handled`
    )
  }
}
