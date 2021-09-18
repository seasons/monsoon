import "module-alias/register"

import chargebee from "chargebee"

import { ErrorService } from "../modules/Error/services/error.service"
import { RentalService } from "../modules/Payment/services/rental.service"
import { PaymentUtilsService } from "../modules/Utils/services/paymentUtils.service"
import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"
import {
  Customer,
  CustomerMembership,
  CustomerMembershipSubscriptionData,
  PauseReason,
  PauseRequest,
  Prisma,
  User,
} from ".prisma/client"

const ps = new PrismaService()
const timeUtils = new TimeUtilsService()
const paymentUtils = new PaymentUtilsService(ps, timeUtils)
const rentalService = new RentalService(ps, timeUtils, new ErrorService())

// This is a handcut list of people who, even though they have a failed payment,
// we are going to grandfather into the new system with all the benefits that assumes.
// We made these decisions by looking at their accounts on an individual basis. The basic
// heuristic was if they have been a good customer for some time but just happen to have a
// failed payment, we grandfather them.
const delinquentCustomersToGrandfather = [
  "543arc@gmail.com",
  "benjgordon95@gmail.com",
  "congund@gmail.com",
  "sfgray26@gmail.com",
  "gregorysantos@bellsouth.net",
  "bruceleeroy827@gmail.com",
  "dustin.vutera@gmail.com",
  "farren@farrenjeanandrea.com",
  "craigbrown.gatech@gmail.com",
  "slowbandemic@gmail.com",
  "fanbuckeye26@gmail.com",
  "jgoldstein40@gmail.com",
  "fdilone30@gmail.com",
  "mcmillendaniel@gmail.com",
  "mcarthurjoseph@gmail.com",
  "chris.kigar93@gmail.com",
  "dpollis@gmail.com",
]

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const customerSelect = Prisma.validator<Prisma.CustomerSelect>()({
  id: true,
  status: true,
  bagItems: { select: { status: true } },
  user: { select: { id: true, email: true } },
  membership: {
    select: {
      id: true,
      plan: { select: { planID: true } },
      subscription: {
        select: {
          subscriptionId: true,
          id: true,
          planID: true,
          status: true,
          planPrice: true,
          nextBillingAt: true,
        },
      },
      pauseRequests: {
        orderBy: { createdAt: "desc" },
        select: { pauseType: true, pausePending: true },
      },
    },
  },
  reservations: {
    // active reservations
    where: { status: { notIn: ["Cancelled", "Completed", "Lost"] } },
    select: { id: true },
  },
})

const migrateAllCustomers = async () => {
  const customers = await ps.client.customer.findMany({
    where: { status: { in: ["Active", "PaymentFailed", "Paused"] } },
    select: customerSelect,
  })

  let i = 0
  for (const cust of customers) {
    console.log(`cust ${i++} of ${customers.length}`)
    let chargebeeSubscription
    try {
      if (!!cust.membership?.subscription) {
        chargebeeSubscription = await getChargebeeSubscription(
          cust.membership.subscription.subscriptionId
        )

        // Change their plan first, since this impacts the billing dates for their rental invoice
        const isSomeKindOfPaused = await isAnyFlavorOfPaused(
          cust,
          chargebeeSubscription
        )

        const isDelinquentCustomerGettingMovedToAccessMonthly =
          cust.status === "PaymentFailed" &&
          !delinquentCustomersToGrandfather.includes(cust.user.email)
        if (
          isSomeKindOfPaused ||
          isDelinquentCustomerGettingMovedToAccessMonthly
        ) {
          const { subscription } = await moveToAccessMonthlyImmediately(
            cust.membership.subscription.subscriptionId
          )
          await updateCustomerSubscriptionData(
            cust.membership.subscription.id,
            subscription
          )
        } else {
          if (chargebeeSubscription.status !== "active") {
            throw new Error(
              `Invalid logic. Trying to grandfather a customer with an inactive subscription. Cust: ${cust.id}`
            )
          }

          await ps.client.customer.update({
            where: { id: cust.id },
            data: { membership: { update: { grandfathered: true } } },
          })
          await addInitialProratedPromotionalCredit(cust)
        }

        await rentalService.initDraftRentalInvoice(
          cust.membership.id,
          "execute"
        )
        await markCustomersAsActiveUnlessPaymentFailed(cust)
      }
    } catch (err) {
      console.log(err)
    }
  }
}

const markCustomersAsActiveUnlessPaymentFailed = async (
  customer: Pick<Customer, "id" | "status">
) => {
  await ps.client.customer.update({
    where: { id: customer.id },
    data: {
      status: customer.status === "PaymentFailed" ? "PaymentFailed" : "Active",
    },
  })
}
const updateCustomerSubscriptionData = async (
  customerMembershipId,
  chargebeeSubscription
) => {
  const data = await paymentUtils.getCustomerMembershipSubscriptionData(
    chargebeeSubscription
  )
  await ps.client.customerMembership.update({
    where: { id: customerMembershipId },
    data: {
      subscription: { upsert: { create: data, update: data } },
      plan: { connect: { planID: data.planID } },
    },
  })
}
const moveToAccessMonthlyImmediately = async subscriptionId => {
  await chargebee.subscription
    .cancel(subscriptionId)
    .request(handleChargebeeResult)
  return await chargebee.subscription
    .update(subscriptionId, {
      plan_id: "access-monthly",
      end_of_term: false,
      force_term_reset: true,
      coupon_ids: ["FIRST_MONTH_FREE"],
    })
    .request(handleChargebeeResult)
}

const handleChargebeeResult = (err, result) => {
  if (err) {
    console.dir(err, { depth: null })
    return err
  }
  if (result) {
    console.dir(result, { depth: null })
    return result
  }
}

const addInitialProratedPromotionalCredit = async (cust: {
  user: Pick<User, "id">
  membership: Pick<CustomerMembership, "id"> & {
    subscription: Pick<
      CustomerMembershipSubscriptionData,
      "planPrice" | "planID" | "nextBillingAt"
    >
  }
}) => {
  const planID = cust.membership.subscription.planID
  const planPrice = cust.membership.subscription.planPrice
  const daysLeftInTerm = timeUtils.numDaysBetween(
    new Date(),
    cust.membership.subscription.nextBillingAt
  )
  const proratedAmount = Math.round(
    cust.membership.subscription.planPrice * (daysLeftInTerm / 30) * 1.15
  )
  const description =
    `Initial grandfathering promotional credit. Plan: ${planID}` +
    ` at price ${planPrice} with ${daysLeftInTerm} days left in term.` // TODO: Replace 0
  const addCreditsPayload = await chargebee.promotional_credit
    .add({
      customer_id: cust.user.id,
      amount: proratedAmount,
      description,
    })
    .request()
  const totalPromotionalCredits = addCreditsPayload.customer.promotional_credits
  await ps.client.customerMembership.update({
    where: {
      id: cust.membership.id,
    },
    data: {
      creditBalance: totalPromotionalCredits,
    },
  })
}

const getChargebeeSubscription = async subscriptionId => {
  const { subscription } = await chargebee.subscription
    .retrieve(subscriptionId)
    .request((err, result) => {
      if (err) {
        return err
      }
      if (result) {
        return result
      }
    })
  return subscription
}

const isAnyFlavorOfPaused = async (
  cust: Pick<Customer, "status"> & {
    membership: {
      pauseRequests: Pick<PauseRequest, "pausePending" | "pauseType">[]
      subscription: Pick<
        CustomerMembershipSubscriptionData,
        "planID" | "status"
      >
    }
  },
  chargebeeSubscription
) => {
  const hasPendingPauseWithItemsRequest =
    cust.membership.pauseRequests?.[0]?.pausePending &&
    cust.membership.pauseRequests?.[0]?.pauseType === "WithItems"
  const isFullyPausedWithItems = cust.membership.subscription.planID.includes(
    "pause"
  )
  const isPausedWithoutItems = cust.membership.subscription.status === "paused"
  const isPausedOnChargebee = chargebeeSubscription.status === "paused"

  // this variable covers subscriptions which were manually paused in chargebee
  const pauseDateInFuture =
    !!chargebeeSubscription.pause_date &&
    timeUtils.isLaterDate(
      timeUtils.dateFromUTCTimestamp(
        chargebeeSubscription.pause_date,
        "seconds"
      ),
      new Date()
    )

  return (
    hasPendingPauseWithItemsRequest ||
    isFullyPausedWithItems ||
    isPausedWithoutItems ||
    pauseDateInFuture ||
    cust.status === "Paused"
  )
}
migrateAllCustomers()
