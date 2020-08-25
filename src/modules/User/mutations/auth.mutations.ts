import { User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { AuthService } from "../services/auth.service"

@Resolver()
export class AuthMutationsResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly segment: SegmentService
  ) {}

  @Mutation()
  async login(@Args() { email, password }, @User() requestUser) {
    const data = await this.auth.loginUser({
      email: email.toLowerCase(),
      password,
      requestUser,
    })
    return data
  }

  @Mutation()
  async signup(@Args() { email, password, firstName, lastName, details }) {
    const { user, tokenData, customer } = await this.auth.signupUser({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      details,
    })

    // Add them to segment and track their account creation event
    const now = new Date()
    this.segment.client.identify({
      userId: user.id,
      traits: {
        ...this.auth.extractSegmentReservedTraitsFromCustomerDetail(details),
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
    this.segment.client.track({
      userId: user.id,
      event: "Created Account",
      properties: {
        name: `${user.firstName} ${user.lastName}`,
        email: `${user.email}`,
        customerID: customer.id,
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
    return await this.auth.resetPassword(email.toLowerCase())
  }

  @Mutation()
  async refreshToken(@Args() { refreshToken }) {
    return await this.auth.refreshToken(refreshToken)
  }
}
