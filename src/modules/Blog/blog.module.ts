import { PrismaModule } from "@app/prisma/prisma.module"
import { ImageModule } from "@modules/Image/image.module"
import { Module } from "@nestjs/common"

import { ErrorModule } from "../Error/error.module"
import { PushNotificationModule } from "../PushNotification"
import { UtilsModule } from "../Utils/utils.module"
import { WebflowController } from "./controllers/webflow.controller"
import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"
import { WebflowService } from "./services/webflow.service"

@Module({
  imports: [
    UtilsModule,
    PushNotificationModule,
    PrismaModule,
    ErrorModule,
    ImageModule,
  ],
  providers: [BlogService, BlogQueriesResolver, WebflowService],
  controllers: [WebflowController],
  exports: [BlogService],
})
export class BlogModule {}
