import {
  Context,
  Mutation,
  Args,
  Resolver,
} from "@nestjs/graphql"
import { AuthService } from "../services/auth.service"
import { UserInputError, ForbiddenError } from "apollo-server"
import { prisma } from "../../../prisma"
import { User } from "../../../nest_decorators"
import { createOrUpdateAirtableUser } from "../../../airtable/createOrUpdateUser"


@Resolver()
export class AuthMutationsResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  async login(@Args() { email, password }, @User() requestUser) {
    // If they are already logged in, throw an error
    if (requestUser) {
      throw new Error(`user is already logged in`)
    }

    // Get their API access token
    let tokenData
    try {
      tokenData = await this.authService.getAuth0UserAccessToken(email, password)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      throw new UserInputError(err)
    }

    // Get user with this email
    const user = await prisma.user({ email })

    // If the user is a Customer, make sure that the account has been approved
    if (user && user.role === "Customer") {
      const customer = await this.authService.getCustomerFromUserID(user.id)
      if (
        customer &&
        customer.status !== "Active" && customer.status !== "Authorized"
      ) {
        throw new Error(`User account has not been approved`)
      }
    } else {
      throw new Error("User record not found")
    }

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user,
    }
  }

  @Mutation()
  async signup(
    @Args() { email, password, firstName, lastName, details },
    @Context() ctx
  ) {
    // Register the user on Auth0
    let userAuth0ID
    try {
      userAuth0ID = await this.authService.createAuth0User(email, password, {
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
      tokenData = await this.authService.getAuth0UserAccessToken(email, password)
    } catch (err) {
      if (err.message.includes("403")) {
        throw new ForbiddenError(err)
      }
      throw new UserInputError(err)
    }

    // Create a user object in our database
    let user
    try {
      user = await this.authService.createPrismaUser(
        userAuth0ID,
        email,
        firstName,
        lastName,
      )
    } catch (err) {
      throw new Error(err)
    }

    // Create a customer object in our database
    try {
      await this.authService.createPrismaCustomerForExistingUser(
        user.id,
        details,
        "Created",
      )
    } catch (err) {
      throw new Error(err)
    }

    // Insert them into airtable
    createOrUpdateAirtableUser(user, { ...details, status: "Created" })

    // Add them to segment and track their account creation event
    const now = new Date()
    ctx.analytics.identify({
      userId: user.id,
      traits: {
        ...this.authService.extractSegmentReservedTraitsFromCustomerDetail(details),
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
      user,
    }
  }
}
