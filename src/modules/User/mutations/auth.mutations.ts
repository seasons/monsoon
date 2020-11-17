import { User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
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
  async signup(
    @Args() { email, password, firstName, lastName, details, referrerId, utm },
    @Application() application
  ) {
    const { user, tokenData, customer, coupon } = await this.auth.signupUser({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      details,
      referrerId,
      utm,
    })

    // Add them to segment and track their account creation event
    const now = new Date()
    const utmFormatted = {
      utm_source: utm?.source,
      utm_content: utm?.content,
      utm_medium: utm?.medium,
      utm_campaign: utm?.campaign,
      utm_term: utm?.term,
    }
    this.segment.identify(user.id, {
      ...this.auth.extractSegmentReservedTraitsFromCustomerDetail({
        ...details,
        ...customer.detail,
      }),
      ...pick(user, [
        "firstName",
        "lastName",
        "id",
        "roles",
        "email",
        "auth0Id",
      ]),
      ...utmFormatted,
      createdAt: now.toISOString(),
    })

    this.segment.track<{
      customerID: string
      name: string
    }>(user.id, "Created Account", {
      name: `${user.firstName} ${user.lastName}`,
      ...pick(user, ["firstName", "lastName", "email"]),
      customerID: customer.id,
      application,
      ...utmFormatted,
    })

    return {
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      coupon,
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
