import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"
import { User } from "@app/nest_decorators"

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
