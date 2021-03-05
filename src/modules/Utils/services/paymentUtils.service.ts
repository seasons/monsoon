import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"
import chargebee from "chargebee"
import { get, head, pick } from "lodash"
import { DateTime } from "luxon"

@Injectable()
export class PaymentUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly segment: SegmentService
  ) {}

  async updateResumeDate(date, customer) {
    const customerWithMembership = await this.prisma.binding.query.customer(
      { where: { id: customer.id } },
      `
        {
          id
          membership {
            id
            pauseRequests(orderBy: createdAt_DESC) {
              id
            }
          }
        }
      `
    )

    const pauseRequest = customerWithMembership.membership?.pauseRequests?.[0]

    await this.prisma.client.updatePauseRequest({
      where: { id: pauseRequest?.id || "" },
      data: { resumeDate: date },
    })
  }

  createBillingInfoObject(card, chargebeeCustomer) {
    try {
      return {
        brand: card.card_type || card.brand,
        name: `${card.first_name || ""} ${card.last_name || ""}`,
        last_digits: card.last4,
        expiration_month: card.expiry_month,
        expiration_year: card.expiry_year,
        street1: chargebeeCustomer?.billing_address?.line1 || "",
        street2: chargebeeCustomer?.billing_address?.line2 || "",
        city: chargebeeCustomer?.billing_address?.city || "",
        state: chargebeeCustomer?.billing_address?.state || "",
        country: chargebeeCustomer?.billing_address?.country || "",
        postal_code: chargebeeCustomer?.billing_address?.zip || "",
      }
    } catch (err) {
      Sentry.captureException(err)
    }
  }

  getCustomerMembershipSubscriptionData = subscription => ({
    nextBillingAt: !!subscription.next_billing_at
      ? DateTime.fromSeconds(subscription.next_billing_at).toISO()
      : null,
    currentTermEnd: DateTime.fromSeconds(subscription.current_term_end).toISO(),
    currentTermStart: DateTime.fromSeconds(
      subscription.current_term_start
    ).toISO(),
    status: subscription.status,
    planPrice: subscription.plan_amount,
    subscriptionId: subscription.id,
    planID: subscription.plan_id.replace("-gift", ""),
  })

  async getChargebeePaymentSource(userID: string) {
    const cardInfo: any = await new Promise((resolve, reject) => {
      // Get user's payment information from chargebee
      chargebee.payment_source
        .list({
          limit: 1,
          "customer_id[is]": userID,
          "type[is]": "card",
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            const card = get(result, "list[0].payment_source.card")
            if (!card) {
              reject("No card found for customer.")
            }
            resolve(card)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
    return cardInfo
  }

  async resumeSubscription(subscriptionId, date, customer) {
    const resumeDate = !!date
      ? { specific_date: DateTime.fromISO(date).toSeconds() }
      : "immediately"

    const pausePlanIDs = ["pause-1", "pause-2", "pause-3"]

    try {
      const customerWithInfo = await this.prisma.binding.query.customer(
        { where: { id: customer.id } },
        `
        {
          id
          membership {
            id
            plan {
              id
              planID
              itemCount
            }
            pauseRequests(orderBy: createdAt_DESC) {
              id
            }
          }
        }
      `
      )

      const pauseRequest = head(customerWithInfo.membership.pauseRequests)
      const customerPlanID = customerWithInfo.membership.plan.planID

      let success

      if (pausePlanIDs.includes(customerPlanID)) {
        const itemCount = customerWithInfo.membership.plan.itemCount
        let newPlanID
        if (itemCount === 1) {
          newPlanID = "essential-1"
        } else if (itemCount === 2) {
          newPlanID = "essential-2"
        } else if (itemCount === 3) {
          newPlanID = "essential"
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
        await this.prisma.client.updatePauseRequest({
          where: { id: pauseRequest.id },
          data: { pausePending: false },
        })

        await this.prisma.client.updateCustomer({
          data: {
            status: "Active",
          },
          where: { id: customer.id },
        })

        const customerWithData = await this.prisma.binding.mutation.updateCustomer(
          {
            data: {
              status: "Active",
            },
            where: { id: customer.id },
          },
          `{
              id
              user {
                id
                firstName
                lastName
                email
              }
              membership {
                id
                plan {
                  id
                  tier
                  planID
                }
              }
            }`
        )

        const tier = customerWithData?.membership?.plan?.tier
        const planID = customerWithData?.membership?.plan?.planID

        this.segment.track(customerWithData.user.id, "Resumed Subscription", {
          ...pick(customerWithData.user, ["firstName", "lastName", "email"]),
          planID,
          tier,
        })
      }
    } catch (e) {
      if (
        e?.api_error_code &&
        e?.api_error_code === "payment_processing_failed"
      ) {
        await this.prisma.client.updatePauseRequest({
          where: { id: pauseRequest.id },
          data: { pausePending: false },
        })
        await this.prisma.client.updateCustomer({
          data: {
            status: "PaymentFailed",
          },
          where: { id: customer.id },
        })
      }
      throw e
    }
  }
}
