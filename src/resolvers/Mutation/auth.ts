import {
  createPrismaCustomerForExistingUser,
  createAuth0User,
  createPrismaUser,
  getAuth0UserAccessToken,
  isLoggedIn,
} from "../../auth/utils"
import { Context, getCustomerFromUserID } from "../../utils"
import { CustomerDetail } from "../../prisma"
import { UserInputError, ForbiddenError } from "apollo-server"
import { createOrUpdateAirtableUser } from "../../airtable/createOrUpdateUser"

export const auth = {
  // The signup mutation signs up users with a "Customer" role.
  async signup(
    obj,
    { email, password, firstName, lastName, details },
    ctx: Context,
    info
  ) {
    // Register the user on Auth0
    let userAuth0ID
    try {
      userAuth0ID = await createAuth0User(email, password, {
        firstName,
        lastName,
      })
    } catch (err) {
      if (err.message.includes("400")) {
        throw new UserInputError(err)
      }
      throw new Error(err)
    }

    // Get their API access token
    let tokenData
    try {
      tokenData = await getAuth0UserAccessToken(email, password)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      throw new UserInputError(err)
    }

    // Create a user object in our database
    let user
    try {
      user = await createPrismaUser(ctx, {
        auth0Id: userAuth0ID,
        email,
        firstName,
        lastName,
      })
    } catch (err) {
      throw new Error(err)
    }

    // Create a customer object in our database
    let customer
    try {
      customer = await createPrismaCustomerForExistingUser(ctx, {
        userID: user.id,
        details,
        status: "Created",
      })
    } catch (err) {
      throw new Error(err)
    }

    // Insert them into airtable
    createOrUpdateAirtableUser(user, { ...details, status: "Created" })

    // Add them to segment and track their account creation event
    let now = new Date()
    ctx.analytics.identify({
      userId: user.id,
      traits: {
        ...extractSegmentReservedTraitsFromCustomerDetail(details),
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: now.toISOString(),
        id: user.id,
        role: user.role,
        email: user.email,
        auth0Id: user.auth0Id,
      },
    })
    ctx.analytics.track({
      userId: user.id,
      event: "Created Account",
    })

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user: user,
    }
  },

  async login(obj, { email, password }, ctx: Context, info) {
    // If they are already logged in, throw an error
    if (isLoggedIn(ctx)) {
      throw new Error(`user is already logged in`)
    }

    // Get their API access token
    let tokenData
    try {
      tokenData = await getAuth0UserAccessToken(email, password)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      throw new UserInputError(err)
    }

    // Get user with this email
    let user = await ctx.prisma.user({ email })

    // If the user is a Customer, make sure that the account has been approved
    if (user && user.role == "Customer") {
      const customer = await getCustomerFromUserID(ctx.prisma, user.id)
      if (
        customer &&
        (customer.status !== "Active" && customer.status !== "Authorized")
      ) {
        throw new Error(`User account has not been approved`)
      }
    }

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user,
    }
  },
}

// TODO: Write code for address
interface SegmentReservedTraitsInCustomerDetail {
  phone?: string
  address?: any
}
function extractSegmentReservedTraitsFromCustomerDetail(
  detail: CustomerDetail
): SegmentReservedTraitsInCustomerDetail {
  let traits = {}
  if (!!detail.phoneNumber) {
    traits["phone"] = detail.phoneNumber
  }
  return traits
}
