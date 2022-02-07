import { User } from "@app/decorators"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { ApolloError } from "apollo-server"

import { AuthService } from "../services/auth.service"

@Resolver()
export class AuthMutationsResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly utils: UtilsService
  ) {}

  @Mutation()
  async login(@Args() { email, password }, @User() requestUser, @Info() info) {
    const select = {
      ...this.utils.getSelectFromInfoAt(info, "customer"),
      ...this.utils.getSelectFromInfoAt(info, "user"),
    }

    const data = await this.auth.loginUser({
      email: email.toLowerCase(),
      password,
      requestUser,
      select,
    })
    return data
  }

  @Mutation()
  async signup() {
    throw new ApolloError("Signup is not available anymore")
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
