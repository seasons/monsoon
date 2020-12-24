import { User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { AuthService } from "../services/auth.service"

@Resolver()
export class AuthMutationsResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly segment: SegmentService,
    private readonly utils: UtilsService
  ) {}

  @Mutation()
  async login(@Args() { email, password }, @User() requestUser, @Info() info) {
    const data = await this.auth.loginUser({
      email: email.toLowerCase(),
      password,
      requestUser,
      info,
    })
    return data
  }

  @Mutation()
  async signup(
    @Args()
    { email, password, firstName, lastName, details, referrerId, giftId, utm },
    @Application() application,
    @Info() info
  ) {
    const { user, tokenData, customer } = await this.auth.signupUser({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      details,
      referrerId,
      utm,
      info,
      giftId,
    })

    // Add them to segment and track their account creation event
    const now = new Date()
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
      ...this.utils.formatUTMForSegment(utm),
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
      ...this.utils.formatUTMForSegment(utm),
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
