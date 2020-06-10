import { User } from "@app/decorators"
import { PushNotificationsService } from "@app/modules/PushNotification/services/pushNotifications.service"
import { ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("User")
export class UserFieldsResolver {
  constructor(private readonly pushNotifications: PushNotificationsService) {}

  @ResolveField()
  async beamsToken(@User() user) {
    if (!user) {
      return ""
    }
    return this.pushNotifications.generateToken(user.email)
  }
}
