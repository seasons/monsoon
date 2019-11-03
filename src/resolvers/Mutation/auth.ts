import {
  createPrismaCustomerForExistingUser,
  createAuth0User,
  createPrismaUser,
  getAuth0UserAccessToken,
  isLoggedIn,
} from "../../auth/utils"
import { Context } from "../../utils"
import { UserInputError, ForbiddenError } from "apollo-server"
import { createUser } from "../../airtable/createUser"

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
    let token
    try {
      token = await getAuth0UserAccessToken(email, password)
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
      })
    } catch (err) {
      throw new Error(err)
    }

    // TODO: save user in customer table in airtable
    createUser(
      {
        firstName,
        lastName,
        email,
      },
      details
    )

    return {
      token,
      user: user,
    }
  },

  async login(obj, { email, password }, ctx: Context, info) {
    // If they are already logged in, throw an error
    if (isLoggedIn(ctx)) {
      throw new Error(`user is already logged in`)
    }

    // Get their API access token
    let token
    try {
      token = await getAuth0UserAccessToken(email, password)
      console.log('token', token)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      console.log('err', err)
      throw new UserInputError(err)
    }

    // Get user with this email
    let user = await ctx.prisma.user({ email })

    return { token, user }
  },
}
