import { WinstonLogger } from "@app/lib/logger"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { GRANDFATHERED_PLAN_IDS } from "@app/modules/Utils/constants"
import { StatementsService } from "@app/modules/Utils/services/statements.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Logger, Post } from "@nestjs/common"
import { CustomerStatus } from "@prisma/client"
import chargebee from "chargebee"
import { pick } from "lodash"

import { PaymentService } from "../services/payment.service"
import { RentalService } from "../services/rental.service"

export type ChargebeeEvent = {
  content: any
  event_type: string
}

export type RentalInvoiceWithCustomerID = {
  id: string
  membership: {
    customerId: string
  }
}

// For a full list of webhook types, see https://apidocs.chargebee.com/docs/api/events#event_types
const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed"
const CHARGEBEE_SUBSCRIPTION_CREATED = "subscription_created"
const CHARGEBEE_PAYMENT_SOURCE_UPDATED = "payment_source_updated"
const CHARGEBEE_PAYMENT_SOURCE_ADDED = "payment_source_added"
const CHARGEBEE_PAYMENT_SUCCEEDED = "payment_succeeded"
const CHARGEBEE_PAYMENT_FAILED = "payment_failed"
const CHARGEBEE_PROMOTIONAL_CREDITS_ADDED = "promotional_credits_added"

@Controller("chargebee_events")
export class ChargebeeController {
  private readonly logger = (new Logger(
    ChargebeeController.name
  ) as unknown) as WinstonLogger

  constructor(
    private readonly payment: PaymentService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly email: EmailService,
    private readonly utils: UtilsService,
    private readonly statements: StatementsService,
    private readonly rental: RentalService
  ) {}

  @Post()
  async handlePost(@Body() body: ChargebeeEvent) {
    this.logger.log("Chargebee event", (body as unknown) as string)

    switch (body.event_type) {
      case CHARGEBEE_SUBSCRIPTION_CREATED:
        await this.chargebeeSubscriptionCreated(body.content)
        break
      case CHARGEBEE_CUSTOMER_CHANGED:
        await this.chargebeeCustomerChanged(body.content)
        break
      case CHARGEBEE_PAYMENT_SUCCEEDED:
        // Add the cedits before doing other things so that a downstream failure doesn't get in the way of credit creation
        await this.addGrandfatheredPromotionalCredits(body.content)
        await this.setPurchaseCredits(body.content)
        await this.chargebeePaymentSucceeded(body.content)
        break
      case CHARGEBEE_PAYMENT_FAILED:
        await this.chargebeePaymentFailed(body.content)
        break
      case CHARGEBEE_PROMOTIONAL_CREDITS_ADDED:
        await this.creditsAdded(body.content)
        break
      case CHARGEBEE_PAYMENT_SOURCE_UPDATED:
      case CHARGEBEE_PAYMENT_SOURCE_ADDED:
        await this.updatedPaymentSource(body.content)
        break
    }
  }

  private async updatedPaymentSource(content: any) {
    const { customer: chargebeeCustomer } = content
    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: chargebeeCustomer.id } },
      select: {
        id: true,
        status: true,
        user: { select: { id: true, email: true, firstName: true } },
      },
    })
    if (prismaCustomer.status === "PaymentFailed") {
      await this.prisma.client.customer.update({
        where: { id: prismaCustomer.id },
        data: { status: "Active" },
      })
      await this.email.sendReturnToGoodStandingEmail(prismaCustomer.user)
    }
  }

  private async creditsAdded(content: any) {
    const { promotional_credit, customer: chargebeeCustomer } = content

    if (!promotional_credit.description.includes("MONSOON_IGNORE")) {
      const prismaCustomer = await this.prisma.client.customer.findFirst({
        where: { user: { id: chargebeeCustomer.id } },
        select: { id: true },
      })
      try {
        await chargebee.promotional_credit
          .deduct({
            customer_id: chargebeeCustomer.id,
            amount: promotional_credit.amount,
            description: "Automatically move to internal system",
          })
          .request()
        await this.prisma.client.customer.update({
          where: { id: prismaCustomer.id },
          data: {
            membership: {
              update: {
                creditBalance: { increment: promotional_credit.amount },
                creditUpdateHistory: {
                  create: {
                    amount: promotional_credit.amount,
                    reason:
                      "Automatic transfer of credits added on chargebee to internal system.",
                  },
                },
              },
            },
          },
        })
      } catch (err) {
        this.logger.error(
          "Unable to handle promotional credits added in chargebee controller",
          { error: err, content }
        )
      }
    }
  }

  private async setPurchaseCredits(content: any) {
    const chargebeeCustomerID = content.customer.id
    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: chargebeeCustomerID } },
      select: {
        id: true,
        user: { select: { id: true } },
        membership: {
          select: {
            id: true,
            plan: {
              select: {
                planID: true,
              },
            },
          },
        },
      },
    })

    const accessPlanIds = ["access-monthly", "access-yearly"]
    const planId = prismaCustomer.membership.plan.planID

    const isPlanPayment = content.invoice.line_items.some(
      li => li.entity_type === "plan"
    )

    if (accessPlanIds.includes(planId) && isPlanPayment) {
      await this.prisma.client.customerMembership.update({
        where: { id: prismaCustomer.membership.id },
        data: {
          purchaseCredits: planId === "access-yearly" ? 3000 : 2000,
        },
      })
    }
  }

  private async addGrandfatheredPromotionalCredits(content: any) {
    const { customer, invoice } = content
    const chargebeeCustomerID = customer.id
    const invoiceId = invoice?.id || "N/A"
    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: chargebeeCustomerID } },
      select: {
        id: true,
        user: { select: { id: true } },
        membership: {
          select: {
            id: true,
            grandfathered: true,
            creditBalance: true,
            plan: {
              select: {
                planID: true,
                price: true,
              },
            },
            creditUpdateHistory: { select: { reason: true } },
          },
        },
      },
    })

    if (prismaCustomer?.membership?.grandfathered) {
      const isTraditionalPlanPayment = content.invoice.line_items.some(
        li =>
          li.entity_type === "plan" &&
          GRANDFATHERED_PLAN_IDS.includes(li.entity_id)
      )
      const alreadyAddedCreditsForInvoice = prismaCustomer.membership.creditUpdateHistory.some(
        a => a.reason.includes(`Invoice #${invoiceId}`)
      )

      if (isTraditionalPlanPayment && !alreadyAddedCreditsForInvoice) {
        const planLineItem = content.invoice.line_items.find(
          a => a.entity_type === "plan"
        )
        const newCredits = Math.round(planLineItem.amount * 1.15)

        await this.prisma.client.customerMembership.update({
          where: {
            id: prismaCustomer.membership.id,
          },
          data: {
            creditBalance: { increment: newCredits },
            creditUpdateHistory: {
              create: {
                amount: newCredits,
                reason: `Grandfathered customer paid subscription dues on ${planLineItem.description} plan. Invoice #${invoiceId}`,
              },
            },
          },
        })
      }
    }
  }

  private async chargebeePaymentSucceeded(content: any) {
    const { subscription, customer, transaction } = content
    const custWithData = await this.prisma.client.customer.findFirst({
      where: { user: { id: customer.id } },
      select: {
        id: true,
        status: true,
        detail: { select: { id: true, impactId: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        utm: {
          select: {
            source: true,
            medium: true,
            campaign: true,
            term: true,
            content: true,
          },
        },
      },
    })

    if (custWithData?.status === "PaymentFailed") {
      await this.prisma.client.customer.update({
        where: { id: custWithData.id },
        data: { status: "Active" },
      })
      await this.email.sendReturnToGoodStandingEmail(custWithData.user)
    }

    const invoice = await this.rental.initFirstRentalInvoice(custWithData.id)
    if (invoice) {
      await this.rental.updateEstimatedTotal(
        invoice as RentalInvoiceWithCustomerID
      )
    }

    this.segment.track(customer.id, "Completed Transaction", {
      ...pick(custWithData.user, ["firstName", "lastName", "email"]),
      transactionID: transaction.id,
      ...(!!subscription
        ? { coupons: subscription.coupons, subscriptionID: subscription.id }
        : {}),
      paymentMethod: transaction.payment_method,
      gateway: transaction.gateway,
      transactionType: transaction.type,
      amount: transaction.amount,
      currency: "USD",
      total: transaction.amount / 100,
      ...this.utils.formatUTMForSegment(custWithData.utm as any),
    })
  }

  private async chargebeePaymentFailed(content: any) {
    const { customer, invoice, subscription } = content

    const isFailureForBuyUsed = invoice?.notes?.find(a =>
      a.note?.includes("Purchase Used")
    )
    const isFailureForBuyNew = invoice?.notes?.find(a =>
      a.note?.includes("Purchase New")
    )
    if (isFailureForBuyUsed || isFailureForBuyNew) {
      return
    }
    // Else, it's a failure for a subscription charge, or a custom charge.

    const userId = customer?.id
    const cust = await this.prisma.client.customer.findFirst({
      where: { user: { id: userId } },
      select: {
        id: true,
        status: true,
        user: { select: { id: true, email: true, firstName: true } },
      },
    })
    if (!!cust) {
      if (this.statements.isPayingCustomer(cust)) {
        const isFailureForSubscription = !!subscription
        await this.prisma.client.customer.update({
          where: { id: cust.id },
          data: { status: "PaymentFailed" },
        })
        if (isFailureForSubscription) {
          await this.email.sendUnpaidMembershipEmail(cust.user)
        }
      }
    }
  }

  private async chargebeeSubscriptionCreated(content: any) {
    const { customer } = content

    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: customer.id } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })

    await this.rental.initFirstRentalInvoice(prismaCustomer.id)
  }

  private async chargebeeCustomerChanged(content: any) {
    const {
      customer: { id },
      card = {},
    } = content

    // no card data on the payload
    if (Object.keys(card).length > 0) {
      await this.payment.chargebeeCustomerChanged(id, card)
    } else {
      this.error.setExtraContext(content, "chargebeePayload.content")
      this.error.captureMessage(
        `Chargebee customer_changed payload without card in content`
      )
    }
  }
}
