import { User } from "@app/decorators"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("User")
export class UserFieldsResolver {
  constructor(
    private readonly pushNotification: PushNotificationService,
    private readonly utils: UtilsService
  ) {}

  @ResolveField()
  async beamsToken(@User() user) {
    if (!user) {
      return ""
    }
    return this.pushNotification.generateToken(user.email)
  }

  @ResolveField()
  async completeAccountURL(@Parent() user) {
    const idHash = this.utils.encryptUserIDHash(user.id)
    return `${process.env.SEEDLING_URL}/complete?idHash=${idHash}`
  }
}
