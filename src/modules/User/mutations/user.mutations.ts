import { User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { DripService } from "@app/modules/Drip/services/drip.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class UserMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly drip: DripService
  ) {}

  @Mutation()
  async unsubscribeUserFromEmails(@Args() { id }) {
    const u = await this.prisma.client.user.findUnique({ where: { id } })
    if (!!u) {
      await this.prisma.client.user.update({
        where: { id },
        data: { sendSystemEmails: false },
      })
      await this.drip.client.unsubscribeFromAllMailings(u.email)
    }
  }

  @Mutation()
  async updateUserPushNotificationStatus(
    @Args() { newStatus },
    @User() user,
    @Select() select
  ) {
    if (!user) {
      throw new Error("Missing user from context")
    }

    const memberWithPushNotification = await this.prisma.client.user.findUnique(
      {
        where: { id: user.id },
        select: { id: true, pushNotification: { select: { id: true } } },
      }
    )

    return await this.prisma.client.userPushNotification.update({
      where: {
        id: memberWithPushNotification.pushNotification.id,
      },
      data: { status: newStatus },
      select,
    })
  }

  @Mutation()
  async updateUser(@Args() { data, where }, @Select() select) {
    return await this.prisma.client.user.update({
      where,
      data,
      select,
    })
  }

  @Mutation()
  async createInterestedUser(@Args() { email, zipcode }, @Info() info) {
    const interestUser = await this.prisma.client.interestedUser.create({
      data: {
        email,
        zipcode,
      },
    })

    // TODO: Subscribe user to newsletter and send welcome email

    return interestUser
  }
}
