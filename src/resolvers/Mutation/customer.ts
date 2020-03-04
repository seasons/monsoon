import { UserInputError } from "apollo-server"
import chargebee from "chargebee"
import get from "lodash.get"
import sgMail from "@sendgrid/mail"
import zipcodes from "zipcodes"
import { shippoValidateAddress } from "./address"
import { createOrUpdateAirtableUser } from "../../airtable/createOrUpdateUser"
import { getCustomerFromContext, getUserFromContext } from "../../auth/utils"
import { emails } from "../../emails"
import { getChargebeePaymentSource, updateChargebeeBillingAddress } from "../Payment"
import { User } from "../../prisma"
import { sendTransactionalEmail } from "../../sendTransactionalEmail"
import {
  Context,
  setCustomerPrismaStatus,
  getCustomerFromUserID,
} from "../../utils"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

export const customer = {
  async addCustomerDetails(
    obj,
    { details, event, status },
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

  async updatePaymentAndShipping(obj, { billingAddress, phoneNumber, shippingAddress }, ctx: Context, info) {
    const user = await getUserFromContext(ctx)
    const customer = await getCustomerFromContext(ctx)

    const {
      city: billingCity,
      postalCode: billingPostalCode,
      state: billingState,
      street1: billingStreet1,
      street2: billingStreet2
    } = billingAddress
    const { isValid: billingAddressIsValid } = await shippoValidateAddress({
      name: user.firstName,
      street1: billingStreet1,
      city: billingCity,
      state: billingState,
      zip: billingPostalCode
    })
    if (!billingAddressIsValid) {
      throw new Error("Billing address is invalid")
    }

    // Update user's billing address on chargebee
    await updateChargebeeBillingAddress(
      user.id,
      billingStreet1,
      billingStreet2,
      billingCity,
      billingState,
      billingPostalCode
    )

    // Update customer's billing address
    await updateCustomerBillingAddress(
      ctx,
      user.id,
      customer.id,
      billingStreet1,
      billingStreet2,
      billingCity,
      billingState,
      billingPostalCode
    )

    // Update customer's shipping address & phone number. Will throw an
    // error if the address is not in NYC
    await updateCustomerDetail(ctx, user, customer, shippingAddress, phoneNumber)

    return null
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
        .request(async function (error, result) {
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

async function updateCustomerDetail(ctx, user, customer, shippingAddress, phoneNumber) {
  const {
    city: shippingCity,
    postalCode: shippingPostalCode,
    state: shippingState,
    street1: shippingStreet1,
    street2: shippingStreet2
  } = shippingAddress
  const { isValid: shippingAddressIsValid } = await shippoValidateAddress({
    name: user.firstName,
    street1: shippingStreet1,
    city: shippingCity,
    state: shippingState,
    zip: shippingPostalCode
  })
  if (!shippingAddressIsValid) {
    throw new Error("Shipping address is invalid")
  }

  const zipcodesData = zipcodes.lookup(parseInt(shippingPostalCode))
  const validCities = ["Brooklyn", "New York", "Queens", "The Bronx"]
  if (zipcodesData?.state !== "NY" || !validCities.includes(zipcodesData?.city)) {
    throw new Error("SHIPPING_ADDRESS_NOT_NYC")
  }

  // Update the user's shipping address
  const detailID = await ctx.prisma.customer({ id: customer.id })
    .detail()
    .id()
  const shippingAddressData = {
    slug: `${user.firstName}-${user.lastName}-shipping-address`,
    name: `${user.firstName} ${user.lastName}`,
    city: shippingCity,
    zipCode: shippingPostalCode,
    state: shippingState,
    address1: shippingStreet1,
    address2: shippingStreet2,
  }
  if (detailID) {
    const shippingAddressID = await ctx.prisma.customer({ id: customer.id })
      .detail()
      .shippingAddress()
      .id()
    const shippingAddress = await ctx.prisma.upsertLocation({
      create: shippingAddressData,
      update: shippingAddressData,
      where: { id: shippingAddressID }
    })
    if (shippingAddress) {
      await ctx.prisma.updateCustomerDetail({
        data: {
          phoneNumber,
          shippingAddress: { connect: { id: shippingAddress.id } }
        },
        where: { id: detailID }
      })
    }
  } else {
    await ctx.prisma.updateCustomer({
      data: {
        detail: {
          create: {
            phoneNumber,
            shippingAddress: {
              create: shippingAddressData
            }
          }
        }
      },
      where: { id: customer.id }
    })
  }
}

async function updateCustomerBillingAddress(
  ctx,
  userID,
  customerID,
  billingStreet1,
  billingStreet2,
  billingCity,
  billingState,
  billingPostalCode
) {
  const billingAddressData = {
    city: billingCity,
    postal_code: billingPostalCode,
    state: billingState,
    street1: billingStreet1,
    street2: billingStreet2
  }
  const billingInfoId = await ctx.prisma.customer({ id: customerID })
    .billingInfo()
    .id()
  if (billingInfoId) {
    await ctx.prisma.updateBillingInfo({
      data: billingAddressData,
      where: { id: billingInfoId }
    })
  } else {
    // Get user's card information from chargebee
    const cardInfo = await getChargebeePaymentSource(userID)
    const { brand, expiry_month, expiry_year, first_name, last4, last_name } = cardInfo

    // Create new billing info object
    const billingInfo = await ctx.prisma.createBillingInfo({
      ...billingAddressData,
      brand,
      expiration_month: expiry_month,
      expiration_year: expiry_year,
      last_digits: last4,
      name: `${first_name} ${last_name}`,
    })

    // Connect new billing info to customer object
    await ctx.prisma.updateCustomer({
      data: { billingInfo: { connect: { id: billingInfo.id } } },
      where: { id: customerID }
    })
  }
}