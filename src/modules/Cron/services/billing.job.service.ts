import { CustomerMembershipService } from "@app/modules/Customer/services/customerMembership.service"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class BillingScheduledJobs {
  private readonly logger = new Logger(`Cron: ${BillingScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly membership: CustomerMembershipService,
    private readonly rental: RentalService
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

    for (const customer of customers) {
      promises.push(
        this.prisma.client.customer.update({
          where: {
            id: customer.id,
          },
          data: {
            membership: {
              update: {
                currentBalance: await this.membership.calculateCurrentBalance(
                  customer.id,
                  { upTo: "today" }
                ),
              },
            },
          },
        })
      )
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
        membership: {
          plan: { tier: "Access" },
        },
        billingEndAt: {
          lte: new Date(),
        },
        status: "Draft",
      },
      select: CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
    })

    let resultDict = { successes: [], errors: [] }
    for (const invoice of invoicesToHandle) {
      invoicesHandled++
      try {
        const planID = invoice.membership.plan.planID as AccessPlanID
        const lineItems = await this.rental.createRentalInvoiceLineItems(
          invoice
        )
        await this.rental.chargeTab(planID, invoice, lineItems)
        resultDict.successes.push(invoice.membership.customer.user.email)
      } catch (err) {
        resultDict.errors.push({
          email: invoice.membership.customer.user.email,
          err,
        })
        console.log(err)
        this.error.setExtraContext(invoice)
        this.error.captureError(err)
      }
    }

    this.logger.log(
      `End handle rental invoices job: ${invoicesHandled} invoices handled`
    )
    this.logger.log(resultDict)
  }
}
