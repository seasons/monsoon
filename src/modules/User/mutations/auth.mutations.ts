import { User } from "@app/decorators"
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { AuthService } from "../services/auth.service"

@Resolver()
export class AuthMutationsResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation()
  async login(@Args() { email, password }, @User() requestUser) {
    const data = await this.authService.loginUser({
      email: email.toLowerCase(),
      password,
      requestUser,
    })
    return data
  }

  @Mutation()
  async signup(
    @Args() { email, password, firstName, lastName, details },
    @Context() ctx
  ) {
    const { user, tokenData, customer } = await this.authService.signupUser({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      details,
    })

    // Add them to segment and track their account creation event
    const now = new Date()
    ctx?.analytics?.identify({
      userId: user.id,
      traits: {
        ...this.authService.extractSegmentReservedTraitsFromCustomerDetail(
          details
        ),
        ...pick(user, [
          "firstName",
          "lastName",
          "id",
          "roles",
          "email",
          "auth0Id",
        ]),
        createdAt: now.toISOString(),
      },
    })
    ctx?.analytics?.track({
      userId: user.id,
      event: "Created Account",
      properties: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    })

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user,
      customer,
    }
  }

  @Mutation()
  async resetPassword(@Args() { email }) {
    return await this.authService.resetPassword(email.toLowerCase())
  }

  @Mutation()
  async refreshToken(@Args() { refreshToken }) {
    return await this.authService.refreshToken(refreshToken)
  }
}
