import "module-alias/register"

import chargebee from "chargebee"
import { head } from "lodash"
import { DateTime } from "luxon"

import { SegmentService } from "../../modules/Analytics/services/segment.service"
import { PaymentService } from "../../modules/Payment/services/payment.service"
import { PaymentUtilsService } from "../../modules/Utils/services/paymentUtils.service"
import { PrismaService } from "../../prisma/prisma.service"

const customerID = "ckls6sjes01nh07700bejpmmm"

const createPausedCustomer = async () => {
  // Use this method to create the customer with the desired test

  const ps = new PrismaService()
  const segment = new SegmentService()
  const paymentUtils = new PaymentUtilsService(ps, segment)

  const customerWithMembership = await ps.binding.query.customer(
    { where: { id: customerID } },
    `
    {
      id
      membership {
        id
        subscription {
          id
          currentTermEnd
        }
      }
    }
    `
  )
  const termEnd = DateTime.local().minus({ days: 7 }).toISO()
  const resumeDateISO = DateTime.fromISO(termEnd).plus({ months: 1 }).toISO()

  await ps.client.createPauseRequest({
    membership: { connect: { id: customerWithMembership.membership.id } },
    pausePending: true,
    pauseDate: new Date(termEnd),
    resumeDate: new Date(resumeDateISO),
    pauseType: "WithItems",
  })
}

const updatePausePendingToPaused = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })
  const ps = new PrismaService()
  const segment = new SegmentService()
  const paymentUtils = new PaymentUtilsService(ps, segment)

  const pausePendingID = "cklswnnj205eg0770urplh572"

  const pauseRequests = await ps.client.pauseRequests({
    where: {
      pausePending: true,
      id_in: [pausePendingID],
    },
  })

  console.log("1", pauseRequests)

  for (const pauseRequest of pauseRequests) {
    try {
      if (DateTime.fromISO(pauseRequest.pauseDate) <= DateTime.local()) {
        const pauseRequestWithCustomer = (await ps.binding.query.pauseRequest(
          { where: { id: pauseRequest.id } },
          `
                {
                  id
                  membership {
                    id
                    subscriptionId
                    customer {
                      id
                    }
                    plan {
                      id
                      itemCount
                    }
                  }
                }
              `
        )) as any

        const customerId = pauseRequestWithCustomer?.membership?.customer?.id

        if (customerId !== customerID) {
          return
        }

        if (pauseRequest.pauseType === "WithItems") {
          console.log("2")
          const itemCount =
            pauseRequestWithCustomer?.membership?.plan?.itemCount
          let planID
          if (itemCount === 1) {
            planID = "pause-1"
          } else if (itemCount === 2) {
            planID = "pause-2"
          } else if (itemCount === 3) {
            planID = "pause-3"
          }

          await chargebee.subscription
            .update(pauseRequestWithCustomer.membership.subscriptionId, {
              plan_id: planID,
            })
            .request()

          await ps.client.updatePauseRequest({
            where: { id: pauseRequest.id },
            data: { pausePending: false },
          })

          await ps.client.updateCustomerMembership({
            where: { id: pauseRequestWithCustomer.membership.id },
            data: {
              plan: { connect: { planID } },
            },
          })

          await ps.client.updateCustomer({
            data: {
              status: "Paused",
            },
            where: { id: customerId },
          })

          console.log("3")

          console.log(`Paused customer subscription with items: ${customerId}`)
        } else {
          const reservations = await ps.client
            .customer({ id: customerId })
            .reservations({ orderBy: "createdAt_DESC" })

          const latestReservation = head(reservations)

          if (
            latestReservation &&
            !["Completed", "Cancelled"].includes(latestReservation.status)
          ) {
            const customer = await ps.client.pauseRequests({
              where: {
                id: customerId,
              },
            })

            const subscriptionId =
              pauseRequestWithCustomer?.membership?.subscriptionId

            if (!subscriptionId) {
              return
            }

            // Customer has an active reservation so we restart membership
            await paymentUtils.resumeSubscription(
              subscriptionId,
              null,
              customer
            )
            console.log(`Resumed customer subscription: ${customerId}`)
          } else {
            // Otherwise we can pause the membership if no active reservations
            await ps.client.updatePauseRequest({
              where: { id: pauseRequest.id },
              data: { pausePending: false },
            })

            await ps.client.updateCustomer({
              data: {
                status: "Paused",
              },
              where: { id: customerId },
            })
            console.log(
              `Paused customer subscription without items: ${customerId}`
            )
          }
        }
      }
    } catch (e) {
      console.log("e", e)
      // Sentry.captureException(JSON.stringify(e))
    }
  }
}

updatePausePendingToPaused()

// createPausedCustomer()
