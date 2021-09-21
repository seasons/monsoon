import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { EmailService } from "@app/modules/Email/services/email.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
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

// For a full list of webhook types, see https://apidocs.chargebee.com/docs/api/events#event_types
const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed"
const CHARGEBEE_SUBSCRIPTION_CREATED = "subscription_created"
const CHARGEBEE_SUBSCRIPTION_CANCELLED = "subscription_cancelled"
const CHARGEBEE_PAYMENT_SUCCEEDED = "payment_succeeded"
const CHARGEBEE_PAYMENT_FAILED = "payment_failed"
const CHARGEBEE_PROMOTIONAL_CREDITS_DEDUCTED = "promotional_credits_deducted"
const CHARGEBEE_PROMOTIONAL_CREDITS_ADDED = "promotional_credits_added"
const CHARGEBEE_INVOICE_GENERATED = "invoice_generated"

@Controller("chargebee_events")
export class ChargebeeController {
  private readonly logger = new Logger(`Cron: ${ChargebeeController.name}`)

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
      case CHARGEBEE_SUBSCRIPTION_CANCELLED:
        await this.chargebeeSubscriptionCancelled(body.content)
        break
      case CHARGEBEE_CUSTOMER_CHANGED:
        await this.chargebeeCustomerChanged(body.content)
        await this.updatePromotionalCreditBalance(body.content.customer.id)
        break
      case CHARGEBEE_PAYMENT_SUCCEEDED:
        await this.chargebeePaymentSucceeded(body.content)
        await this.addGrandfatheredPromotionalCredits(body.content)
        break
      case CHARGEBEE_PAYMENT_FAILED:
        await this.chargebeePaymentFailed(body.content)
        break
      case CHARGEBEE_PROMOTIONAL_CREDITS_DEDUCTED:
      case CHARGEBEE_PROMOTIONAL_CREDITS_ADDED:
        await this.updatePromotionalCreditBalance(
          body.content.customer.id,
          true
        )
        break
      case CHARGEBEE_INVOICE_GENERATED:
        await this.updatePromotionalCreditBalance(
          body.content.invoice.customer_id
        )
        break
    }
  }

  private async updatePromotionalCreditBalance(
    chargebeeCustomerID: string,
    forceUpdate = false
  ) {
    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: chargebeeCustomerID } },
      select: {
        id: true,
        membership: {
          select: {
            grandfathered: true,
            id: true,
          },
        },
      },
    })

    if (prismaCustomer?.membership?.grandfathered || forceUpdate) {
      const chargebeeCustomer = await chargebee.customer
        .retrieve(chargebeeCustomerID)
        .request()

      await this.prisma.client.customerMembership.update({
        where: {
          id: prismaCustomer.membership.id,
        },
        data: {
          creditBalance: chargebeeCustomer.customer.promotional_credits,
        },
      })
    }
  }

  private async addGrandfatheredPromotionalCredits(content: any) {
    const chargebeeCustomerID = content.customer.id
    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: chargebeeCustomerID } },
      select: {
        id: true,
        membership: {
          select: {
            id: true,
            grandfathered: true,
            plan: {
              select: {
                planID: true,
                price: true,
              },
            },
          },
        },
      },
    })

    if (prismaCustomer?.membership?.grandfathered) {
      let totalPromotionalCredits
      const plan = prismaCustomer.membership.plan
      const isPlanPayment = content.invoice.line_items.some(
        li => li.entity_id === plan.planID
      )

      if (isPlanPayment) {
        // Add promotional credits if this is a plan payment
        const credits = prismaCustomer.membership.plan.price * 1.15
        const addCreditsPayload = await chargebee.promotional_credit
          .add({
            customer_id: chargebeeCustomerID,
            amount: credits,
            description: `Grandfathered ${prismaCustomer.membership.plan.planID} credits`,
          })
          .request()
        totalPromotionalCredits = addCreditsPayload.customer.promotional_credits
      } else {
        // If not a plan payment update the customers creditBalance without adding
        const chargebeeCustomer = await chargebee.customer
          .retrieve(chargebeeCustomerID)
          .request()
        totalPromotionalCredits = chargebeeCustomer.customer.promotional_credits
      }

      await this.prisma.client.customerMembership.update({
        where: {
          id: prismaCustomer.membership.id,
        },
        data: {
          creditBalance: totalPromotionalCredits,
        },
      })
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
      let newStatus: CustomerStatus = subscription.plan_id.includes("pause")
        ? "Paused"
        : "Active"
      await this.prisma.client.customer.update({
        where: { id: custWithData.id },
        data: { status: newStatus },
      })
      await this.email.sendReturnToGoodStandingEmail(custWithData.user)
    }

    let isRecurringSubscription =
      !!subscription &&
      !this.utils.isSameDay(
        new Date(subscription.created_at * 1000),
        new Date()
      )
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
      impactId: custWithData.detail?.impactId,
      impactCustomerStatus: isRecurringSubscription ? "Existing" : null,
      text1: isRecurringSubscription ? "isRecurringSubscription" : "null",
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
        // TODO: Send email for other kinds of failures
      }
    } else {
      this.error.setExtraContext({ payload: content }, "chargebeePayload")
      this.error.captureMessage(`Unable to locate customer for failed payment`)
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

  private async chargebeeSubscriptionCancelled(content: any) {
    const { customer } = content
    const prismaCustomer = await this.prisma.client.customer.findFirst({
      where: { user: { id: customer.id } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    })
    await this.prisma.client.customer.update({
      where: { id: prismaCustomer.id },
      data: { status: "Deactivated" },
    })
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
