import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { BlogService } from "../services/blog.service"

@Resolver()
export class BlogQueriesResolver {
  constructor(private readonly blogService: BlogService) {}

  @Query()
  async blogPosts(@Args() args, @Info() info) {
    const data = await this.blogService.getPosts({
      collectionId: "5ee266d741919756c8167f2a",
      limit: args.count,
    })

    return data?.map(item => {
      return {
        id: item._id,
        name: item.name,
        slug: item.slug,
        imageURL: item["article-image"]?.url,
        imageAlt: item["article-image"]?.alt,
        thumbnailURL: item["article-header-image"]?.url,
        url: `https://blog.seasons.nyc/posts/${item.slug}`,
        tags: item.tags,
        createdAt: item["created-on"],
        updatedAt: item["updated-on"],
        publishedOn: item["published-on"],
      }
    })
  }
}
