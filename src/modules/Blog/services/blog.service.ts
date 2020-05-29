import { UtilsService } from "@app/modules/Utils"
import { Injectable } from "@nestjs/common"
import { head, pick } from "lodash"
import moment from "moment"

import { BlogPost } from "../blog.types"
import { BlogPostsCollectionId } from "../constants"
import { WebflowService } from "./webflow.service"

@Injectable()
export class BlogService {
  constructor(
    private readonly webflow: WebflowService,
    private readonly utils: UtilsService
  ) {}

  async getPosts({
    collectionId = BlogPostsCollectionId,
    limit,
  }: {
    collectionId?: string
    limit?: number
  }) {
    const publishedPosts = await this.getAllPosts(collectionId)

    if (limit) {
      return publishedPosts?.slice(0, limit)
    }

    return publishedPosts
  }

  async getLastPost(collectionId = BlogPostsCollectionId): Promise<BlogPost> {
    const publishedPosts = await this.getAllPosts(collectionId)

    // published posts in order of most recently updated
    publishedPosts.sort((a, b) => {
      const timeA = moment(a.updatedAt)
      const timeB = moment(b.updatedAt)
      return timeA.isAfter(timeB) ? -1 : 1
    })

    return head(publishedPosts)
  }

  private async getAllPosts(collectionId: string): Promise<BlogPost[]> {
    const allPosts = []
    let offset = 0
    while (true) {
      const data = await this.webflow.client.items({ collectionId }, { offset })
      allPosts.push(...data?.items)
      offset = data?.offset
      if (!offset) {
        break
      }
    }
    return allPosts
      .map(this.utils.camelCaseify)
      .filter(post => !post.archived && !post.draft)
      .map(item => ({
        ...pick(item, ["id", "name", "slug", "tags"]),
        imageURL: item.articleImage?.url,
        imageAlt: item.articleImage?.alt,
        thumbnailURL: item.articleHeaderImage?.url,
        url: `https://blog.seasons.nyc/posts/${item.slug}`,
        createdAt: item.createdOn,
        updatedAt: item.updatedOn,
        publishedOn: item.publishedOn,
      }))
  }
}
