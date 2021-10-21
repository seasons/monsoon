import "module-alias/register"

import chargebee from "chargebee"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handle = (err, result) => {
  if (err) {
    return err
  }
  if (result) {
    return result
  }
}

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const customersToAudit = await ps.client.customer.findMany({
    where: {
      OR: [
        { status: { in: ["Active", "PaymentFailed", "Deactivated"] } },
        {
          reservations: {
            some: {
              status: {
                in: [
                  "Blocked",
                  "Cancelled",
                  "Completed",
                  "Delivered",
                  "Hold",
                  "Lost",
                  "Packed",
                  "Picked",
                  "Queued",
                  "ReturnPending",
                  "Shipped",
                  "Unknown",
                ],
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      membership: { select: { creditBalance: true } },
      user: { select: { id: true, email: true } },
    },
  })

  let offset = "start"
  const allChargebeePromotionalCreditLogs = []
  const allInvoices = []
  try {
    while (true) {
      await sleep(500)
      let list
      ;({ next_offset: offset, list } = await chargebee.promotional_credit
        .list({
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request(handle))
      allChargebeePromotionalCreditLogs.push(
        ...list?.map(a => a.promotional_credit)
      )
      if (!offset) {
        break
      }
    }
    offset = "start"

    while (true) {
      await sleep(500)
      let list
      ;({ next_offset: offset, list } = await chargebee.invoice
        .list({
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request(handle))
      allInvoices.push(...list?.map(a => a.invoice))
      if (!offset) {
        break
      }
    }
  } catch (err) {
    console.log(err)
  }

  const flags = []
  for (const cust of customersToAudit) {
    await sleep(500)
    try {
      let chargebeeCustomer = { promotional_credits: 0 }
      try {
        ;({ customer: chargebeeCustomer } = await chargebee.customer
          .retrieve(cust.user.id)
          .request(handle))
      } catch (err) {
        // we don't care about people not in chargebee
        if (err.error_code === "resource_not_found") {
          continue
        }
        console.log(err)
      }

      const chargebeeCreditLogsForCust = allChargebeePromotionalCreditLogs.filter(
        a => a.customer_id === cust.user.id
      )
      const invoicesForCustomer = allInvoices.filter(
        a => a.customer_id === cust.user.id
      )

      const initialCredit = chargebeeCreditLogsForCust.find(a =>
        a.description.includes("Initial grandfathering promotional credit")
      )

      const invociesSinceSept20 = invoicesForCustomer.filter(a => {
        const invoiceCreatedAt = timeUtils.dateFromUTCTimestamp(
          a.date,
          "seconds"
        )
        const onOrAfterSept20 = timeUtils.isLaterDate(
          invoiceCreatedAt,
          new Date(2021, 8, 20)
        )
        return onOrAfterSept20
      })
      const oldWorldPlanMembershipChargesSinceSept20 = invociesSinceSept20
        .flatMap(a => a.line_items)
        .filter(
          a =>
            a.entity_type === "plan" &&
            a.entity_type !== "access-monthly" &&
            a.entity_type !== "access-yearly"
        )
      const totalOldWorldMembershipDuesCharged = oldWorldPlanMembershipChargesSinceSept20.reduce(
        (acc, curval) => {
          return acc + curval.amount
        },
        0
      )
      const totalCreditsFromMembershipDues =
        totalOldWorldMembershipDuesCharged * 1.15

      const promotionalCreditAdjustmentsByAdmin = chargebeeCreditLogsForCust.filter(
        a => a.done_by.includes("seasons.nyc")
      )
      const totalPromotionalCreditsFromAdminAdjustments = promotionalCreditAdjustmentsByAdmin.reduce(
        (acc, curval) => {
          if (curval.type === "increment") {
            return acc + curval.amount
          } else {
            return acc - curval.amount
          }
        },
        0
      )

      const totalExpectedCredits =
        initialCredit +
        totalCreditsFromMembershipDues +
        totalPromotionalCreditsFromAdminAdjustments

      // If they have more credits than we expect, flag them
      if (
        totalExpectedCredits <
        chargebeeCustomer.promotional_credits + cust.membership.creditBalance
      ) {
        flags.push(cust)
      }

      // Flag number two: Two "Grandfathered access-yearly credits" (or analogous for access-monthly) in a row
    } catch (err) {
      console.log(err)
    }
  }

  console.log("func complete")
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

run()
