import { Args, Context, Mutation, Resolver } from "@nestjs/graphql"
import { ForbiddenError, UserInputError } from "apollo-server"

import { AuthService } from "../services/auth.service"
import { User } from "@app/nest_decorators"
import { prisma } from "@prisma/index"

@Resolver()
export class AuthMutationsResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  async beamsData(@User() user) {
    const { email } = user
    if (email) {
      const beamsToken = this.authService.beamsClient?.generateToken(
        email
      ) as any
      return {
        beamsToken: beamsToken.token,
        email,
      }
    }
  }

  @Mutation()
  async login(@Args() { email, password }, @User() requestUser) {
    // If they are already logged in, throw an error
    if (requestUser) {
      throw new Error(`user is already logged in`)
    }

    // Get their API access token
    let tokenData
    try {
      tokenData = await this.authService.getAuth0UserAccessToken(
        email,
        password
      )
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
        customer.status !== "Active" &&
        customer.status !== "Authorized"
      ) {
        throw new Error(`User account has not been approved`)
      }
    } else {
      throw new Error("User record not found")
    }

    const { token: beamsToken } = this.authService.beamsClient?.generateToken(
      email
    ) as any

    const params = {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user,
      beamsToken,
    }
    return params
  }

  @Mutation()
  async signup(
    @Args() { email, password, firstName, lastName, details },
    @Context() ctx
  ) {
    const { user, tokenData } = await this.authService.signupUser({
      email,
      password,
      firstName,
      lastName,
      details,
    })

    // Add them to segment and track their account creation event
    const now = new Date()
    ctx.analytics.identify({
      userId: user.id,
      traits: {
        ...this.authService.extractSegmentReservedTraitsFromCustomerDetail(
          details
        ),
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

  @Mutation()
  async resetPassword(@Args() { email }) {
    return await this.authService.resetPassword(email)
  }
}
