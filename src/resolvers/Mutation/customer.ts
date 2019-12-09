import {
  Context,
  setCustomerPrismaStatus,
  sendTransactionalEmail,
  getCustomerFromUserID,
} from "../../utils"
import { getCustomerFromContext, getUserFromContext } from "../../auth/utils"
import { UserInputError } from "apollo-server"
import chargebee from "chargebee"
import { createOrUpdateAirtableUser } from "../../airtable/createOrUpdateUser"
import sgMail from "@sendgrid/mail"
import { User } from "../../prisma"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

export const customer = {
  /*
        Test Cases for addCustomerDetails resolver:
        IF user submits an 'id' field in the resolver inputs, they get an error. 
    
        IF there is no value for the Authorization header, THEN they get a 401. 
    
        IF they use a token for an admin, THEN they get a 401
    
        IF they use a token for a partner, THEN they get a 401
    
        IF they add details to a customer with no existing customerDetail record, 
        THEN a new record is created 
        AND the customer record's "detail" field has the id of the newly created customerDetail record
    
        IF they add details to a customer with an existing details object
        THEN the existing record is updated, with any fields that were previously
        written to overwritten if the payload includes values for them. 
        */
  async addCustomerDetails(
    obj,
    { details, status, event },
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
    let updatedDetails
    let currentCustomerDetail = await ctx.prisma
      .customer({ id: customer.id })
      .detail()
    if (currentCustomerDetail == null) {
      await ctx.prisma.updateCustomer({
        data: { detail: { create: details } },
        where: { id: customer.id },
      })
      updatedDetails = await ctx.prisma.customer({ id: customer.id }).detail()
    } else {
      updatedDetails = await ctx.prisma.updateCustomerDetail({
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

  async acknowledgeCompletedChargebeeHostedCheckout(
    obj,
    { hostedPageID },
    ctx: Context,
    info
  ) {
    let prismaCustomer
    try {
      await chargebee.hosted_page
        .acknowledge(hostedPageID)
        .request(async function(error, result) {
          if (error) {
            throw error
          } else {
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

  async saveProduct(obj, { item, save }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    let updatedSavedProducts

    let key = save ? "connect" : "disconnect"

    // await ctx.prisma.updateCustomer({
    //   where: {
    //     id: customer.id,
    //   },
    //   data: {
    //     savedProducts: {
    //       [key]: [{ id: item }],
    //     },
    //   },
    // })

    return { ...customer, savedProduct: updatedSavedProducts }
  },
}

function sendWelcomeToSeasonsEmail(user: User) {
  sendTransactionalEmail(user.email, "d-05ae098e5bfb47eb9372ea2c461ffcf6", {
    name: user.firstName,
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
