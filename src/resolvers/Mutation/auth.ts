import {
  createPrismaCustomerForExistingUser,
  createAuth0User,
  createPrismaUser,
  getAuth0UserAccessToken,
} from "../../auth/utils"
import { Context } from "../../utils"
import { UserInputError, ForbiddenError } from "apollo-server"

export const auth = {
  // The signup mutation signs up users with a "Customer" role.
  async signup(
    obj,
    { email, password, firstName, lastName },
    ctx: Context,
    info
  ) {
    // Register the user on Auth0
    let userAuth0ID
    try {
      userAuth0ID = await createAuth0User(email, password)
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
      })
    } catch (err) {
      throw new Error(err)
    }

    return {
      token,
      user: user,
    }
  },
}
