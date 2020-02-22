import {
  Resolver,
  Query,
  ResolveProperty,
  Context,
  Info,
} from "@nestjs/graphql"
import { UseGuards } from "@nestjs/common"
import { getUserRequestObject, getCustomerFromContext } from "../../auth/utils"
import { PrismaService } from "../../prisma/prisma.service"
import { User as CurrUser } from "./user.decorator"
import { GraphqlAuthGuard } from "./auth.guard"

@Resolver("Me")
export class MeResolver {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(GraphqlAuthGuard)
  @Query()
  async me() {
    return {}
  }

  @ResolveProperty()
  async user(@Context() ctx, @CurrUser() user) {
    const { id } = await getUserRequestObject(ctx)
    return ctx.prisma.user({ id })
  }
}
