import {
  Query,
  Context,
  Info,
  Mutation,
  Args,
  Resolver,
} from "@nestjs/graphql"
import { AuthService } from "./auth.service"
import { UserInputError, ForbiddenError } from "apollo-server"
import { prisma } from "../../prisma"
import { User } from "./user.decorator"


@Resolver()
export class AuthResolver {
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
}
