import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { EmailService } from "@modules/Email/services/email.service"
import { Injectable } from "@nestjs/common"
import { Customer, PauseType, PaymentPlan, User } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { head, orderBy, pick } from "lodash"
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
    private readonly segment: SegmentService,
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
        },
      })
    } catch (e) {
      this.error.setExtraContext({ planID })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error updating to new plan: ${e.message}`)
    }
  }

  async resumeSubscription(
    subscriptionId,
    date,
    customer: Pick<Customer, "id">
  ) {
    const resumeDate = !!date
      ? { specific_date: DateTime.fromISO(date).toSeconds() }
      : "immediately"

    const pausePlanIDs = ["pause-1", "pause-2", "pause-3", "pause-6"]

    const customerWithData = await this.prisma.client.customer.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        membership: {
          select: {
            id: true,
            plan: { select: { id: true, planID: true, itemCount: true } },
            pauseRequests: { select: { id: true, createdAt: true } },
          },
        },
      },
    })

    const pauseRequest = head(
      orderBy(customerWithData.membership.pauseRequests, "createdAt", "desc")
    )

    try {
      const customerPlanID = customerWithData.membership.plan.planID

      let success

      if (pausePlanIDs.includes(customerPlanID)) {
        const itemCount = customerWithData.membership.plan.itemCount
        let newPlanID
        if (itemCount === 1) {
          newPlanID = "essential-1"
        } else if (itemCount === 2) {
          newPlanID = "essential-2"
        } else if (itemCount === 3) {
          newPlanID = "essential"
        } else if (itemCount === 6) {
          newPlanID = "essential-6"
        }
        // Customer is paused with items on a pause plan
        // Check if the user is on a pause plan and switch plans instead of updating chargebee
        success = await chargebee.subscription
          .update(subscriptionId, {
            plan_id: newPlanID,
          })
          .request()
      } else {
        // Customer is paused without items
        success = await chargebee.subscription
          .resume(subscriptionId, {
            resume_option: resumeDate,
            unpaid_invoices_handling: "schedule_payment_collection",
          })
          .request()
      }

      if (success) {
        await this.prisma.client.customer.update({
          where: { id: customer.id },
          data: {
            status: "Active",
            membership: {
              update: {
                pauseRequests: {
                  update: {
                    where: { id: pauseRequest.id },
                    data: { pausePending: false },
                  },
                },
              },
            },
          },
        })

        const customerWithTrackingData = await this.prisma.client.customer.findUnique(
          {
            where: { id: customer.id },
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              membership: {
                select: {
                  id: true,
                  plan: { select: { id: true, tier: true, planID: true } },
                },
              },
            },
          }
        )

        const tier = customerWithTrackingData?.membership?.plan?.tier
        const planID = customerWithTrackingData?.membership?.plan?.planID

        this.segment.track(
          customerWithTrackingData.user.id,
          "Resumed Subscription",
          {
            ...pick(customerWithTrackingData.user, [
              "firstName",
              "lastName",
              "email",
            ]),
            planID,
            tier,
          }
        )
      }
    } catch (e) {
      if (
        e?.api_error_code &&
        e?.api_error_code === "payment_processing_failed"
      ) {
        // don't set status to `PaymentFailed` here because we do it in the
        // chargebee webhook
        await this.prisma.client.pauseRequest.update({
          where: { id: pauseRequest.id },
          data: { pausePending: false },
        })
      }
      throw e
    }
  }

  async pauseSubscription(
    subscriptionId,
    customer,
    pauseType: PauseType = "WithoutItems",
    reasonID
  ) {
    const customerWithMembership = await this.prisma.client.customer.findUnique(
      {
        where: { id: customer.id },
        select: {
          id: true,
          membership: {
            select: {
              id: true,
              subscription: { select: { id: true, currentTermEnd: true } },
            },
          },
          bagItems: { select: { id: true, status: true } },
        },
      }
    )

    const numReservedItemsInBag = customerWithMembership.bagItems?.filter(
      a => a.status === "Reserved"
    )?.length

    if (pauseType === "WithItems" && numReservedItemsInBag === 0) {
      throw new Error(
        `Error pausing subscription: You must have reserved items to pause with items.`
      )
    }

    try {
      let termEnd
      let resumeDateISO

      if (pauseType === "WithItems") {
        termEnd = customerWithMembership?.membership?.subscription.currentTermEnd.toISOString()
        resumeDateISO = DateTime.fromISO(termEnd).plus({ months: 1 }).toISO()
      } else {
        const result = await chargebee.subscription
          .pause(subscriptionId, {
            pause_option: "immediately",
          })
          .request()

        termEnd = DateTime.fromSeconds(
          result?.subscription?.current_term_end
        ).toISO()
        if (!termEnd) {
          throw new Error(
            "Unable to query term end for subscription. Please try again"
          )
        }
        resumeDateISO = DateTime.fromISO(termEnd).plus({ months: 1 }).toISO()
      }

      return await this.prisma.client.pauseRequest.create({
        data: {
          membership: {
            connect: { id: customerWithMembership?.membership?.id },
          },
          pausePending: true,
          pauseDate: termEnd,
          resumeDate: resumeDateISO,
          pauseType,
          reason: reasonID && { connect: { id: reasonID } },
          notified: false,
        },
      })
    } catch (e) {
      this.error.setExtraContext({ subscriptionId })
      this.error.setExtraContext(customer, "customer")
      this.error.captureError(e)
      throw new Error(`Error pausing subscription: ${JSON.stringify(e)}`)
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

  async removeScheduledPause(subscriptionId, customer) {
    try {
      const pauseRequest = await this.prisma.client.pauseRequest.findFirst({
        where: {
          membership: {
            customer: {
              id: customer.id,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (pauseRequest.pauseType === "WithoutItems") {
        await chargebee.subscription
          .resume(subscriptionId, {
            resume_option: "immediately",
            charges_handling: "add_to_unbilled_charges",
          })
          .request()
      }

      return await this.prisma.client.pauseRequest.update({
        where: { id: pauseRequest.id },
        data: { pausePending: false },
      })
    } catch (e) {
      if (
        e?.api_error_code &&
        e?.api_error_code !== "invalid_state_for_request"
      ) {
        this.error.setExtraContext({ subscriptionId })
        this.error.setExtraContext(customer, "customer")
        this.error.captureError(e)
        throw new Error(`Error removing scheduled pause: ${e}`)
      }
    }
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
