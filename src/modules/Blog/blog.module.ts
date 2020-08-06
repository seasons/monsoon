import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { PushNotificationModule } from "../PushNotification"
import { WebflowController } from "./controllers/webflow.controller"
import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"
import { WebflowService } from "./services/webflow.service"
import { UtilsModule } from ".."

@Module({
  controllers: [WebflowController],
  imports: [UtilsModule, PushNotificationModule, PrismaModule],
  providers: [BlogService, BlogQueriesResolver, WebflowService],
  exports: [BlogService],
})
export class BlogModule {}
