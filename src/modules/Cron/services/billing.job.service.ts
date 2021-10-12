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

    const promises = []
    let i = 1
    for (const customer of customers) {
      try {
        promises.push(
          this.prisma.client.customer.update({
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
        )
        this.logger.log(
          `Done setting current balance on customer ${i++} of ${
            customers.length
          }`
        )
      } catch (err) {
        this.logger.error(`Error while setting current balance on customer`, {
          customer,
          error: err,
        })
      }
    }

    await this.prisma.client.$transaction(promises)

    this.logger.log(
      `End update current balance on ${customers.length} customers`
    )
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
        status: "Draft",
      },
      select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
    })

    for (const invoice of invoicesToHandle) {
      invoicesHandled++
      try {
        const planID = invoice.membership.plan.planID as AccessPlanID
        const lineItems = await this.rental.createRentalInvoiceLineItems(
          invoice
        )
        await this.rental.chargeTab(planID, invoice, lineItems)
      } catch (err) {
        console.log(err)
        this.error.setExtraContext(invoice)
        this.error.captureError(err)
        this.logger.error("Rental invoice billing failed", {
          invoice,
          error: err,
        })
      }
    }

    this.logger.log(
      `End handle rental invoices job: ${invoicesHandled} invoices handled`
    )
  }
}
