import { Module } from "@nestjs/common"

import { UtilsModule } from "../Utils"
import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"
import { WebflowService } from "./services/webflow.service"

@Module({
  imports: [UtilsModule],
  providers: [BlogService, BlogQueriesResolver, WebflowService],
  exports: [BlogService],
})
export class BlogModule {}
