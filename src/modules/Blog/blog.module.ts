import { HttpModule, Module } from "@nestjs/common"

import { BlogQueriesResolver } from "./queries/blog.queries.resolver"
import { BlogService } from "./services/blog.service"

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  providers: [BlogService, BlogQueriesResolver],
  exports: [BlogService],
})
export class BlogModule {}
