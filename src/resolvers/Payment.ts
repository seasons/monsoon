import { Context, encryptUserIDHash, getCustomerFromUserID } from "../utils"
import { getUserFromContext, getCustomerFromContext } from "../auth/utils"
import chargebee from "chargebee"
import get from "lodash.get"

// Configure chargebee before making API call
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

export const Payment = {
  chargebeeCheckout: async (
    parent,
    { planID, userIDHash },
    ctx: Context,
    info
  ) => {
    // Is there a user in the db that corresponds to the given userIDHash?
    const allUsers = await ctx.prisma.users()
    let targetUser
    for (const user of allUsers) {
      let thisUsersIDHash = encryptUserIDHash(user.id)
      if (thisUsersIDHash === userIDHash) {
        targetUser = user
      }
    }
    if (targetUser === undefined) {
      throw new Error(`no user found for idHash: ${userIDHash}`)
    }

    // Get email, firstName, lastName, phoneNumber of targetUser
    const { email, firstName, lastName } = targetUser
    const correspondingCustomer = await getCustomerFromUserID(
      ctx.prisma,
      targetUser.id
    )
    const { phoneNumber } = await ctx.prisma
      .customer({ id: correspondingCustomer.id })
      .detail()

    // translate the passed planID into a chargebee-readable version
    let truePlanID
    if (planID === "AllAccess") {
      truePlanID = "all-access"
    } else if (planID === "Essential") {
      truePlanID = "essential"
    } else {
      throw new Error("unrecognized planID")
    }

    const hostedPage = await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_new({
          subscription: {
            plan_id: truePlanID,
          },
          customer: {
            id: targetUser.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })

    // Track the selection
    ctx.analytics.track({
      userId: targetUser.id,
      event: "Opened Checkout",
      properties: {
        plan: planID,
      },
    })

    return hostedPage
  },

  chargebeeUpdatePaymentPage: async (parent, {}, ctx, info) => {
    const user = await getUserFromContext(ctx)
    if (!user) {
      throw new Error("No user found.")
    }

    const customer = await getCustomerFromContext(ctx)
    if (!customer) {
      throw new Error("User is not a customer.")
    }

    const hostedPage = await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .manage_payment_sources({
          customer: {
            id: user.id,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })

    return hostedPage
  },
}

export const updateChargebeeBillingAddress = async (
  userID: string,
  billingStreet1: string,
  billingStreet2: string,
  billingCity: string,
  billingState: string,
  billingPostalCode: string
) => {
  await new Promise((resolve, reject) => {
    chargebee.customer
      .update_billing_info(userID, {
        billing_address: {
          line1: billingStreet1,
          line2: billingStreet2,
          city: billingCity,
          state: billingState,
          zip: billingPostalCode,
        },
      })
      .request((error, result) => {
        if (error) {
          reject(JSON.stringify(error))
        } else {
          const chargebeeBillingAddress = get(
            result,
            "customer.billing_address"
          )
          if (!chargebeeBillingAddress) {
            reject("Failed to update billing address on chargebee.")
          }
          resolve(chargebeeBillingAddress)
        }
      })
  })
}

export const getChargebeePaymentSource = async (userID: string) => {
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
