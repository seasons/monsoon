import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { head } from "lodash"

@Resolver("User")
export class UserFieldsResolver {
  constructor(
    private readonly pushNotification: PushNotificationService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  @ResolveField()
  async beamsToken(@Parent() user) {
    if (!user) {
      return ""
    }
    return this.pushNotification.generateToken(
      await this.prisma.client.user({ id: user.id }).email()
    )
  }

  @ResolveField()
  async fullName(@Parent() user) {
    if (!user) {
      return ""
    }
    const rec = await this.prisma.client.user({ id: user.id })
    return `${rec.firstName} ${rec.lastName}`
  }

  @ResolveField()
  async customer(@Parent() user, @Info() info) {
    if (!user) {
      return null
    }

    return head(
      await this.prisma.binding.query.customers(
        {
          where: { user: { id: user.id } },
        },
        info
      )
    )
  }

  @ResolveField()
  async completeAccountURL(@Parent() user) {
    const idHash = this.utils.encryptUserIDHash(user.id)
    return `${process.env.SEEDLING_URL}/complete?idHash=${idHash}`
  }
}
