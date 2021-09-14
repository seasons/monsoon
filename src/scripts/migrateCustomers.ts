import "module-alias/register"

import chargebee from "chargebee"

import { ErrorService } from "../modules/Error/services/error.service"
import { RentalService } from "../modules/Payment/services/rental.service"
import { PaymentUtilsService } from "../modules/Utils/services/paymentUtils.service"
import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"
import { Customer } from ".prisma/client"

const ps = new PrismaService()
const timeUtils = new TimeUtilsService()
const paymentUtils = new PaymentUtilsService(ps, timeUtils)
const rentalService = new RentalService(ps, timeUtils, new ErrorService())

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const migrateActiveCustomers = async () => {}
const migratePausedWithoutItemsCustomers = async () => {}
const migratePausedWithItemsCustomers = async () => {}

const migrateMichaelDevoe = async () => {
  /*
  Do _not_ mark him as grandfathered. Because he has a delinquent invoice he doesn't qualify for promotional credits.
  Update his subscription to be access-monthly starting today, first month free.
  Create first rental invoice, because he'll be an active customer
  */
  const emailsToUpdate = ["michael_devoe6+1@yahoo.com"]
  // const emailsToUpdate = ["fernando-hoeger@seasons.nyc"] testing emails

  const customers = await ps.client.customer.findMany({
    where: { user: { email: { in: emailsToUpdate } } },
    select: {
      id: true,
      status: true,
      bagItems: { select: { status: true } },
      membership: {
        select: {
          id: true,
          subscription: { select: { subscriptionId: true, id: true } },
        },
      },
      reservations: {
        // active reservations
        where: { status: { notIn: ["Cancelled", "Completed", "Lost"] } },
        select: { id: true },
      },
    },
  })
  for (const cust of customers) {
    const { subscription } = await moveToAccessMonthlyImmediately(
      cust.membership.subscription.subscriptionId
    )
    await updateCustomerSubscriptionData(
      cust.membership.subscription.id,
      subscription
    )
    await rentalService.initDraftRentalInvoice(cust.membership.id, "execute")
    await markCustomersAsActiveUnlessPaymentFailed(cust)
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
  customerMembershipSubscriptionId,
  chargebeeSubscription
) => {
  const data = await paymentUtils.getCustomerMembershipSubscriptionData(
    chargebeeSubscription
  )
  await ps.client.customerMembershipSubscriptionData.update({
    where: { id: customerMembershipSubscriptionId },
    data,
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
// migrateMichaelDevoe()
// migrateActiveCustomers()
// migratePausedWithoutItemsCustomers()
// migratePausedWithItemsCustomers()
