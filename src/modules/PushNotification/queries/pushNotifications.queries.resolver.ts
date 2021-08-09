import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class PushNotificationsQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

  @Query()
  async pushNotificationReceipt(@Args() { where }, @Select() select) {
    return await this.queryUtils.resolveFindUnique(
      { where, select },
      "PushNotificationReceipt"
    )
  }

  @Query()
  async pushNotificationReceipts(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "PushNotificationReceipt")
  }

  @Query()
  async pushNotificationReceiptsConnection(@Args() args, @Select() select) {
    return this.queryUtils.resolveConnection(
      { ...args, select },
      "PushNotificationReceipt"
    )
  }
}
