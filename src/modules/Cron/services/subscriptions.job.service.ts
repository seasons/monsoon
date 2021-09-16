import { ErrorService } from "@app/modules/Error/services/error.service"
import { AccessPlanID } from "@app/modules/Payment/payment.types"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "@app/modules/Payment/services/rental.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import chargebee from "chargebee"

@Injectable()
export class SubscriptionsScheduledJobs {
  private readonly logger = new Logger(
    `Cron: ${SubscriptionsScheduledJobs.name}`
  )

  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly rental: RentalService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateSubscriptionData() {
    this.logger.log(`Start update subscriptions field job`)

    let subscription
    let customer
    try {
      const allSubscriptions = []

      let offset = "start"
      while (true) {
        let list
        ;({ next_offset: offset, list } = await chargebee.subscription
          .list({
            limit: 100,
            ...(offset === "start" ? {} : { offset }),
          })
          .request())
        allSubscriptions.push(...list?.map(a => a.subscription))
        if (!offset) {
          break
        }
      }

      for (subscription of allSubscriptions) {
        const userID = subscription.customer_id
        const customer = await this.prisma.client.customer.findFirst({
          where: { user: { id: userID } },
          select: {
            id: true,
            membership: {
              select: { id: true, subscription: { select: { id: true } } },
            },
          },
        })

        if (!customer) {
          console.log("error no customer")
        } else {
          const data = this.paymentUtils.getCustomerMembershipSubscriptionData(
            subscription
          )

          if (!customer.membership?.id) {
            throw new Error(`Customer ${customer.id} has no membership`)
          }
          await this.prisma.client.customerMembership.update({
            where: { id: customer.membership.id },
            data: {
              subscription: { upsert: { create: data, update: data } },
              plan: { connect: { planID: data.planID } },
            },
          })
        }
      }
    } catch (e) {
      console.log("e", e)
      this.error.setExtraContext(subscription, "subscription")
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
    }

    this.logger.log(`Finished update subscriptions field job`)
  }

  // TODO: Turn on when we launch new plans
  // @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleRentalInvoices() {
    this.logger.log(`Start handle rental invoices job`)

    let invoicesHandled = 0
    const invoicesToHandle = await this.prisma.client.rentalInvoice.findMany({
      where: {
        membership: { plan: { tier: "Access" } },
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
        this.error.setExtraContext(invoice)
        this.error.captureError(err)
      }
    }

    this.logger.log(
      `End handle rental invoices job: ${invoicesHandled} invoices handled`
    )
  }
}
