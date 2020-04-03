import { Mutation, Args, Resolver } from "@nestjs/graphql"
import { User } from "../../../nest_decorators"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver()
export class UserMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async updateUserPushNotifications(
    @Args() { pushNotificationsStatus },
    @User() user
  ) {
    if (!user) {
      throw new Error("Missing user from context")
    }

    const updatedUser = await this.prisma.client.updateUser({
      where: {
        id: user.id,
      },
      data: { pushNotifications: pushNotificationsStatus },
    })
    return updatedUser
  }
}
