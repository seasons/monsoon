import { Module } from "@nestjs/common"

import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"

@Module({
  providers: [BlogService, BlogQueriesResolver],
  exports: [BlogService],
})
export class BlogModule {}
