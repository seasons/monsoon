import { Args, Query, Resolver } from "@nestjs/graphql"

import { BlogService } from "../services/blog.service"

@Resolver()
export class BlogQueriesResolver {
  constructor(private readonly blogService: BlogService) {}

  @Query()
  async blogPosts(@Args() args) {
    return this.blogService.getPosts({
      limit: args.count,
    })
  }
}
