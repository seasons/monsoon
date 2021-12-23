import { ErrorService } from "@app/modules/Error/services/error.service"
import { GRANDFATHERED_PLAN_IDS } from "@app/modules/Utils/constants"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { EmailService } from "@modules/Email/services/email.service"
import { Injectable } from "@nestjs/common"
import { Customer, PauseType, PaymentPlan, User } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { DateTime } from "luxon"

import { BillingAddress, Card } from "../payment.types"
import { RentalService } from "./rental.service"

export interface SubscriptionData {
  nextBillingAt: string
  currentTermEnd: string
  currentTermStart: string
  status: string
  planPrice: number
  subscriptionId: string
  planID: string
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly error: ErrorService,
    private readonly rental: RentalService
  ) {}

  async subscriptionEstimate(
    plan: PaymentPlan,
    customer: Customer,
    couponID: string
  ) {
    let billingAddress = null

    if (customer) {
      const customerWithBillingInfo = await this.prisma.client.customer.findFirst(
        {
          where: { id: customer.id },
          select: {
            id: true,
            billingInfo: {
              select: {
                street1: true,
                street2: true,
                city: true,
                state: true,
                postal_code: true,
                country: true,
              },
            },
            detail: {
              select: {
                id: true,
                shippingAddress: {
                  select: {
                    id: true,
                    address1: true,
                    address2: true,
                    city: true,
                    country: true,
                    state: true,
                    zipCode: true,
                  },
                },
              },
            },
          },
        }
      )

      const { billingInfo } = customerWithBillingInfo

      if (!!billingInfo) {
        billingAddress = {
          line1: billingInfo.street1,
          line2: billingInfo.street2,
          city: billingInfo.city,
          state: billingInfo.state,
          zip: billingInfo.postal_code,
          country: "US",
        }
      } else {
        billingAddress = {
          zip: customerWithBillingInfo?.detail?.shippingAddress?.zipCode,
          country: "US",
        }
      }
    }

    const subscriptionEstimate = await chargebee.estimate
      .create_subscription({
        ...(!!billingAddress ? { billing_address: billingAddress } : {}),
        subscription: {
          plan_id: plan.planID,
        },
        ...(!!couponID ? { coupon_ids: [couponID] } : {}),
      })
      .request()

    return subscriptionEstimate.estimate.invoice_estimate
  }

  async changeCustomerPlan(planID, customer) {
    try {
      const customerWithMembership = await this.prisma.client.customer.findUnique(
        {
          where: { id: customer.id },
          select: {
            id: true,
            membership: {
              select: {
                id: true,
                subscriptionId: true,
                subscription: { select: { id: true, currentTermEnd: true } },
              },
            },
            bagItems: { select: { id: true, status: true } },
          },
        }
      )

      const membership = customerWithMembership.membership
      const subscriptionID = membership.subscriptionId

      await chargebee.subscription
        .update(subscriptionID, {
          plan_id: planID,
        })
        .request()

      return await this.prisma.client.customerMembership.update({
        where: { id: membership.id },
        data: {
          plan: { connect: { planID } },
          grandfathered: GRANDFATHERED_PLAN_IDS.includes(planID),
        },
      })
    } catch (e) {
      this.error.setExtraContext({ planID })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error updating to new plan: ${e.message}`)
    }
  }

  async createCustomerSubscriptionInputData({
    subscription,
    card,
    chargebeeCustomer,
    shippingAddress,
    giftID,
  }) {
    const subscriptionData: SubscriptionData = {
      nextBillingAt: DateTime.fromSeconds(subscription.next_billing_at).toISO(),
      currentTermEnd: DateTime.fromSeconds(
        subscription.current_term_end
      ).toISO(),
      currentTermStart: DateTime.fromSeconds(
        subscription.current_term_start
      ).toISO(),
      status: subscription.status,
      planPrice: subscription.plan_amount,
      subscriptionId: subscription.id,
      planID: subscription.plan_id.replace("-gift", ""),
    }

    // Retrieve plan and billing data
    const billingInfo = this.paymentUtils.createBillingInfoObject(
      card,
      chargebeeCustomer
    )

    let updateData: Prisma.CustomerUpdateInput = {
      billingInfo: {
        create: billingInfo,
      },
      status: "Active",
      admissions: {
        update: {
          subscribedAt: new Date(),
          inServiceableZipcode: true,
          admissable: true,
          authorizationsCount: 1,
          allAccessEnabled: false,
        },
      },
      detail: {
        update: {
          shippingAddress: {
            create: shippingAddress,
          },
        },
      },
      membership: {
        create: {
          grandfathered: GRANDFATHERED_PLAN_IDS.includes(
            subscriptionData.planID
          ),
          subscriptionId: subscriptionData.subscriptionId,
          giftId: giftID,
          plan: { connect: { planID: subscriptionData.planID } },
          subscription: {
            create: subscriptionData,
          },
        },
      },
    }

    return updateData
  }

  /**
   * Creates a prisma subscription after a successful payment
   *
   * Platform: web, mobile
   *
   * @param userID
   * @param chargebeeCustomer
   * @param card
   * @param subscription
   * @param giftID
   * @param shippingAddress
   */
  async createPrismaSubscription(
    userID: string,
    chargebeeCustomer: any,
    card: any,
    subscription: any,
    giftID?: string,
    shippingAddress?: any
  ) {
    const customer = await this.prisma.client.customer.findFirst({
      where: { user: { id: userID } },
      select: {
        id: true,
        user: true,
      },
    })

    if (!customer) {
      throw new Error(`Could not find customer with user id: ${userID}`)
    }

    const firstName = customer.user.firstName
    const lastName = customer.user.lastName

    shippingAddress[
      "slug"
    ] = `${firstName}-${lastName}-shipping-${customer.user.id}`.toLowerCase()

    const updateData = await this.createCustomerSubscriptionInputData({
      subscription,
      card,
      giftID,
      shippingAddress,
      chargebeeCustomer,
    })

    await this.prisma.client.customer.update({
      where: { id: customer.id },
      data: updateData,
    })

    await this.rental.initFirstRentalInvoice(customer.id)

    // Send welcome to seasons email
    await this.emailService.sendSubscribedEmail(customer.user)
  }

  async createSubscription(
    planID: string,
    billingAddress: BillingAddress,
    user: User,
    card: Card
  ) {
    const start_date = this.paymentUtils.getSubscriptionStartDate()
    return await chargebee.subscription
      .create({
        plan_id: planID,
        billingAddress,
        start_date,
        customer: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
        },
        card,
      })
      .request()
  }
}
