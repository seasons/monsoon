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

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handleChargebeeResult = (err, result) => {
  if (err) {
    // console.dir(err, { depth: null })
    return err
  }
  if (result) {
    // console.dir(result, { depth: null })
    return result
  }
}

const customerSelect = Prisma.validator<Prisma.CustomerSelect>()({
  id: true,
  status: true,
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

const suspendAccounts = async () => {
  /*
    Query each customer, along with their subscription info
    Cancel them in chargebee
    Mark them as Suspended in our system
    */
  const customerEmails = []

  const customersWithData = await ps.client.customer.findMany({
    where: { user: { email: { in: customerEmails } } },
    select: customerSelect,
  })

  for (const cust of customersWithData) {
    try {
      console.log(`Updating: ${cust.user.email}`)
      console.log(
        `--> Admin Link: http://admin.seasons.nyc/members/${cust.id}/account`
      )
      console.log(
        `--> Chargebee link: https://seasons.chargebee.com/customers?view_code=all&Customers.search=${cust.user.email}`
      )
      console.log(
        `--> Cancel subscription with id ${cust.membership.subscription.id}`
      )
      await chargebee.subscription
        .cancel(cust.membership.subscription.subscriptionId, {
          end_of_term: false,
        })
        .request(handleChargebeeResult)
      console.log(`--> Mark as Suspended`)
      await ps.client.customer.update({
        where: { id: cust.id },
        data: { status: "Suspended" },
      })
    } catch (err) {
      console.log(err)
      console.log(cust)
    }
  }
}

suspendAccounts()
