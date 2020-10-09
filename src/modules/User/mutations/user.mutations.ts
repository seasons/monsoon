import { User } from "@app/decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class UserMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async updateUserPushNotificationStatus(
    @Args() { newStatus },
    @User() user,
    @Info() info
  ) {
    if (!user) {
      throw new Error("Missing user from context")
    }

    const memberWithPushNotification = await this.prisma.binding.query.user(
      {
        where: { id: user.id },
      },
      `
    {
      id
      pushNotification {
        id
      }
    }
    `
    )

    const returnVal = await this.prisma.binding.mutation.updateUserPushNotification(
      {
        where: {
          id: memberWithPushNotification.pushNotification.id,
        },
        data: { status: newStatus },
      },
      info
    )
    return returnVal
  }

  @Mutation()
  async updateUser(@Args() { data, where }, @Info() info) {
    const result = await this.prisma.binding.mutation.updateUser({
      where,
      data,
    })
    return result
  }

  @Mutation()
  async createInterestedUser(@Args() { email, zipcode }, @Info() info) {
    const interestUser = await this.prisma.client.createInterestedUser({
      email,
      zipcode,
    })

    // TODO: Subscribe user to newsletter and send welcome email

    return interestUser
  }
}
