import { User } from "@app/decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class UserMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async updateUserPushNotificationStatus(
    @Args() { pushNotificationStatus },
    @User() user,
    @Info() info
  ) {
    if (!user) {
      throw new Error("Missing user from context")
    }

    const x = await this.prisma.binding.mutation.updateUser(
      {
        where: {
          id: user.id,
        },
        data: { pushNotificationStatus },
      },
      info
    )
    return x
  }
}
