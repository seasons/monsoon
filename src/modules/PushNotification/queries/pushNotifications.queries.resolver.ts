import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class PushNotificationsQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async pushNotificationReceipt(@Args() args, @Info() info) {
    return await this.prisma.binding.query.pushNotificationReceipt(args, info)
  }

  @Query()
  async pushNotificationReceipts(@Args() args, @Info() info) {
    return this.prisma.binding.query.pushNotificationReceipts(args, info)
  }

  @Query()
  async pushNotificationReceiptsConnection(@Args() args, @Info() info) {
    return this.prisma.binding.query.pushNotificationReceiptsConnection(
      args,
      info
    )
  }
}
