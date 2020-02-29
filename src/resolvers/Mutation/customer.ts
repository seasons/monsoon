import {
  Context,
  setCustomerPrismaStatus,
  getCustomerFromUserID,
} from "../../utils"
import { sendTransactionalEmail } from "../../sendTransactionalEmail"
import { getCustomerFromContext, getUserFromContext } from "../../auth/utils"
import { UserInputError } from "apollo-server"
import chargebee from "chargebee"
import get from "lodash.get"
import { createOrUpdateAirtableUser } from "../../airtable/createOrUpdateUser"
import sgMail from "@sendgrid/mail"
import { User } from "../../prisma"
import { emails } from "../../emails"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

export const customer = {
  async addCustomerDetails(
    obj,
    { event, details, status },
    ctx: Context,
    info
  ) {
    // They should not have included any "id" in the input
    if (details.id != null) {
      throw new UserInputError("payload should not include id")
    }

    // Grab the customer off the context
    const user = await getUserFromContext(ctx)
    const customer = await getCustomerFromContext(ctx)

    // Add the details. If necessary, create the details object afresh.
    const currentCustomerDetail = await ctx.prisma
      .customer({ id: customer.id })
      .detail()
    if (currentCustomerDetail == null) {
      await ctx.prisma.updateCustomer({
        data: { detail: { create: details } },
        where: { id: customer.id },
      })
    } else {
      await ctx.prisma.updateCustomerDetail({
        data: details,
        where: { id: currentCustomerDetail.id },
      })
    }

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await setCustomerPrismaStatus(ctx.prisma, user, status)
    }

    // Sync with airtable
    await createOrUpdateAirtableUser(user, {
      ...currentCustomerDetail,
      ...details,
      status,
    })

    // Track the event, if its been passed
    const eventNameMap = { CompletedWaitlistForm: "Completed Waitlist Form" }
    if (!!event) {
      ctx.analytics.track({
        userId: user.id,
        event: eventNameMap[event],
      })
    }

    // Return the updated customer object
    const returnData = await ctx.db.query.customer(
      { where: { id: customer.id } },
      info
    )
    return returnData
  },

  async updateCustomerInfo(
    obj,
    { billingInfo, detail },
    ctx: Context,
    info
  ) {

    // Grab the customer off the context
    const customer = await getCustomerFromContext(ctx)

    if (!customer) {
      throw new Error('No customer object found for user')
    }

    const currentCustomer = ctx.prisma.customer({ id: customer.id })

    // Updates the user's billing information.
    if (billingInfo) {
      const currentCustomerBillingInfo = await currentCustomer.billingInfo()
      if (currentCustomerBillingInfo) {
        await ctx.prisma.updateBillingInfo({
          data: billingInfo,
          where: { id: currentCustomerBillingInfo.id }
        })
      } else {
        await ctx.prisma.updateCustomer({
          data: { billingInfo: { create: billingInfo } },
          where: { id: customer.id }
        })
      }
    }

    // Return the updated customer object
    return await ctx.db.query.customer(
      { where: { id: customer.id } },
      info
    )
  },

  async checkChargebeeUpdate(
    obj,
    { },
    ctx: Context,
    info
  ) {
    const user = await getUserFromContext(ctx)
    if (!user) {
      throw new Error("No user found.")
    }

    const customer = await getCustomerFromContext(ctx)

    if (!customer) {
      throw new Error('No customer object found for user')
    }

    // make the call to chargebee
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })

    const cardInfo: any = await new Promise((resolve, reject) => {
      chargebee.payment_source.list({
        limit: 1,
        "customer_id[is]": user.id,
        "type[is]": "card"
      }).request((error, result) => {
        console.log("RETRIEVE HOSTED PAGE RESPONSE")
        if (error) {
          reject(error)
        } else {
          console.log(result)
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

    const { brand, expiry_month, expiry_year, first_name, last4, last_name } = cardInfo

    const currentCustomer = ctx.prisma.customer({ id: customer.id })
    const billingInfoId = await currentCustomer.billingInfo().id()
    const billingInfoData = {
      brand,
      name: `${first_name} ${last_name}`,
      last_digits: last4,
      expiration_month: expiry_month,
      expiration_year: expiry_year,
    }

    if (billingInfoId) {
      await ctx.prisma.updateBillingInfo({
        data: billingInfoData,
        where: {
          id: billingInfoId,
        }
      })
    } else {
      await ctx.prisma.updateCustomer({
        data: { billingInfo: { create: billingInfoData } },
        where: { id: customer.id }
      })
    }

    return true
  },

  async acknowledgeCompletedChargebeeHostedCheckout(
    obj,
    { hostedPageID },
    ctx: Context,
    info
  ) {
    let prismaCustomer
    // make the call to chargebee
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })
    try {
      console.log("HOST PAGE ID:", hostedPageID)
      await chargebee.hosted_page
        .acknowledge(hostedPageID)
        .request(async function (error, result) {
          console.log("ACKNOWLEDGING")
          if (error) {
            console.log("ERROR:", error)
            throw error
          } else {
            console.log("NO ERROR")
            var {
              subscription,
              card,
              customer: chargebeeCustomer,
            } = result.hosted_page.content

            // Retrieve plan and billing data
            let plan = { essential: "Essential", "all-access": "AllAccess" }[
              subscription.plan_id
            ]
            if (!plan) {
              throw new Error(`unexpected plan-id: ${subscription.plan_id}`)
            }
            let billingInfo = createBillingInfoObject(card, chargebeeCustomer)

            // Save it to prisma
            let prismaUser = await ctx.prisma.user({
              id: subscription.customer_id,
            })
            prismaCustomer = await getCustomerFromUserID(
              ctx.prisma,
              prismaUser.id
            )
            await ctx.prisma.updateCustomer({
              data: {
                plan: plan,
                billingInfo: {
                  create: billingInfo,
                },
                status: "Active",
              },
              where: { id: prismaCustomer.id },
            })

            // Save it to airtable
            await createOrUpdateAirtableUser(prismaUser, {
              status: "Active",
              plan,
              billingInfo,
            })

            // Send welcome to seasons email
            sendWelcomeToSeasonsEmail(prismaUser)

            // Track the event
            ctx.analytics.track({
              userId: prismaUser.id,
              event: "Subscribed",
              properties: {
                plan: plan,
              },
            })

            // Return
            return {
              billingInfo: ctx.prisma
                .customer({ id: prismaCustomer.id })
                .billingInfo(),
              plan: ctx.prisma.customer({ id: prismaCustomer.id }).plan(),
            }
          }
        })
    } catch (err) {
      throw err
    }
  },
}

function sendWelcomeToSeasonsEmail(user: User) {
  sendTransactionalEmail({
    to: user.email,
    data: emails.welcomeToSeasonsData(user.firstName),
  })
}

function getNameFromCard(card) {
  return `${!!card.first_name ? card.first_name : ""}${
    !!card.last_name ? " " + card.last_name : ""
    }`
}

function createBillingInfoObject(card, chargebeeCustomer) {
  return {
    brand: card.card_type,
    name: getNameFromCard(card),
    last_digits: card.last4,
    expiration_month: card.expiry_month,
    expiration_year: card.expiry_year,
    street1: chargebeeCustomer.billing_address.line1,
    street2: chargebeeCustomer.billing_address.line2,
    city: chargebeeCustomer.billing_address.city,
    state: chargebeeCustomer.billing_address.state,
    country: chargebeeCustomer.billing_address.country,
    postal_code: chargebeeCustomer.billing_address.zip,
  }
}
