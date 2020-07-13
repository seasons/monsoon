import { Module } from "@nestjs/common"

import { PushNotificationModule } from "../PushNotification"
import { UtilsModule } from "../Utils"
import { WebflowController } from "./controllers/webflow.controller"
import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"
import { WebflowService } from "./services/webflow.service"

@Module({
  imports: [UtilsModule, PushNotificationModule],
  providers: [
    BlogService,
    BlogQueriesResolver,
    WebflowService,
    WebflowController,
  ],
  exports: [BlogService],
})
export class BlogModule {}
