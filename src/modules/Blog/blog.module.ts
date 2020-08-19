import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { PushNotificationModule } from "../PushNotification"
import { UtilsModule } from "../Utils/utils.module"
import { WebflowController } from "./controllers/webflow.controller"
import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"
import { WebflowService } from "./services/webflow.service"

@Module({
  controllers: [WebflowController],
  imports: [UtilsModule, PushNotificationModule, PrismaModule],
  providers: [BlogService, BlogQueriesResolver, WebflowService],
  exports: [BlogService],
})
export class BlogModule {}
