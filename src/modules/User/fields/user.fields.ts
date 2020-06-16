import { User } from "@app/decorators"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("User")
export class UserFieldsResolver {
  constructor(private readonly pushNotification: PushNotificationService) {}

  @ResolveField()
  async beamsToken(@User() user) {
    if (!user) {
      return ""
    }
    return this.pushNotification.generateToken(user.email)
  }
}
