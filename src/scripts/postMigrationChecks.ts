import "module-alias/register"

import chargebee from "chargebee"

import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()
const timeUtils = new TimeUtilsService()
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const customersToCheck = []
const checks = async () => {
  const customersWithData = await ps.client.customer.findMany({
    where: { user: { email: { in: customersToCheck } } },
    select: {
      hasBeenMigrated: true,
      status: true,
      user: { select: { id: true, email: true } },
      membership: {
        select: {
          grandfathered: true,
          subscription: {
            select: { planID: true, nextBillingAt: true, subscriptionId: true },
          },
          creditBalance: true,
          rentalInvoices: {
            select: { status: true, billingEndAt: true, billingStartAt: true },
          },
        },
      },
    },
  })

  const resultDict = {
    planUpdates: { numSuccesses: 0, errors: [] },
    rentalInvoice: { numSuccesses: 0, errors: [] },
    status: { numSuccesses: 0, errors: [] },
    hasBeenMigrated: { numSuccesses: 0, errors: [] },
    noops: { numSuccesses: 0, errors: [] },
  }
  for (const cust of customersWithData) {
    const { customer: chargebeeCust } = await chargebee.customer
      .retrieve(cust.user.id)
      .request(handleChargebeeResult)
    const {
      subscription: chargebeeSub,
    } = await chargebee.subscription
      .retrieve(cust.membership.subscription.subscriptionId)
      .request(handleChargebeeResult)

    const noSubscription = !cust.membership.subscription
    if (noSubscription) {
      const noRentalInvoices = cust.membership.rentalInvoices.length === 0
      const notMigrated = !cust.hasBeenMigrated
      const notGrandfathered = !cust.membership.grandfathered
      if (noRentalInvoices && notMigrated && notGrandfathered) {
        resultDict.noops.numSuccesses = resultDict.noops.numSuccesses + 1
      } else {
        resultDict.noops.errors.push({
          email: cust.user.email,
          report: { noRentalInvoices, notMigrated, notGrandfathered },
        })
      }
    }

    // Either on access-monthly plan OR grandfathered, >0 in promotional credits OR no subscription
    const isOnAccessMonthly =
      cust.membership.subscription.planID === "access-monthly" &&
      chargebeeSub.plan_id === "access-monthly"
    const isGrandfathered =
      cust.membership.grandfathered &&
      cust.membership.creditBalance > 0 &&
      chargebeeCust.promotional_credits > 0 &&
      cust.membership.creditBalance === chargebeeCust.promotional_credits

    if (
      (isOnAccessMonthly && !isGrandfathered) ||
      (!isOnAccessMonthly && isGrandfathered) ||
    ) {
      resultDict.planUpdates.numSuccesses =
        resultDict.planUpdates.numSuccesses + 1
    } else {
      resultDict.planUpdates.errors.push({
        email: cust.user.email,
        report: { isOnAccessMonthly, isGrandfathered, noSubscription },
      })
    }

    // Has a single rental invoice in status Draft or no subscription
    const rentalInvoiceBasicStateOK =
      cust.membership.rentalInvoices.length === 0 &&
      cust.membership.rentalInvoices[0].status === "Draft"
    let rentalInvoiceBillingEndAtLessThan30DaysFromNow = false
    let rentalInvoiceBillingStartAtToday = false
    if (rentalInvoiceBasicStateOK) {
      rentalInvoiceBillingEndAtLessThan30DaysFromNow =
        timeUtils.numDaysBetween(
          cust.membership.rentalInvoices[0].billingEndAt,
          new Date(timeUtils.xDaysFromNowISOString(30))
        ) < 30
      rentalInvoiceBillingStartAtToday =
        timeUtils.numDaysBetween(
          cust.membership.rentalInvoices[0].billingStartAt,
          new Date()
        ) === 0
    }
    if (
      rentalInvoiceBasicStateOK &&
      rentalInvoiceBillingEndAtLessThan30DaysFromNow &&
      rentalInvoiceBillingStartAtToday
    ) {
      resultDict.rentalInvoice.numSuccesses =
        resultDict.rentalInvoice.numSuccesses + 1
    } else {
      resultDict.rentalInvoice.errors.push({
        email: cust.user.email,
        report: {
          rentalInvoiceBasicStateOK,
          rentalInvoiceBillingEndAtLessThan30DaysFromNow,
          rentalInvoiceBillingStartAtToday,
        },
      })
    }

    // Proper status
    if (cust.status === "Active" || cust.status === "PaymentFailed") {
      resultDict.status.numSuccesses = resultDict.status.numSuccesses + 1
    } else {
      resultDict.status.errors.push({
        email: cust.user.email,
        status: cust.status,
      })
    }

    // Has been migrated set to true
    if (cust.hasBeenMigrated) {
      resultDict.hasBeenMigrated.numSuccesses =
        resultDict.hasBeenMigrated.numSuccesses + 1
    } else {
      resultDict.hasBeenMigrated.errors.push({
        email: cust.user.email,
        hasBeenMigrated: cust.hasBeenMigrated,
      })
    }
  }
  console.dir(resultDict, { depth: null })
  console.log("done")
}

function handleChargebeeResult(err, res) {
  if (err) return err
  if (res) return res
}

