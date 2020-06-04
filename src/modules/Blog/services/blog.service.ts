import { UtilsService } from "@app/modules/Utils"
import { Injectable } from "@nestjs/common"
import { head, pick } from "lodash"
import moment from "moment"

import { BlogPost } from "../blog.types"
import {
  BlogPostsCollectionId,
  BlogPostsURL,
  CategoriesCollectionId,
} from "../constants"
import { WebflowService } from "./webflow.service"

@Injectable()
export class BlogService {
  constructor(
    private readonly webflow: WebflowService,
    private readonly utils: UtilsService
  ) {}

  async getPosts({ limit }: { limit?: number }) {
    const publishedPosts = await this.getAllItems(BlogPostsCollectionId)

    if (limit) {
      return publishedPosts?.slice(0, limit)
    }

    return publishedPosts
  }

  async getLastPost(): Promise<BlogPost> {
    const publishedPosts = await this.getAllItems(BlogPostsCollectionId)

    // published posts in order of most recently updated
    publishedPosts.sort((a, b) => {
      const timeA = moment(a.updatedAt)
      const timeB = moment(b.updatedAt)
      return timeA.isAfter(timeB) ? -1 : 1
    })

    const lastPost = head(publishedPosts)
    if (lastPost) {
      lastPost.category = await this.getCategory(lastPost.category)
    }
    return lastPost
  }

  private async getCategory(categoryId: string): Promise<string> {
    const data = await this.webflow.client.item({
      collectionId: CategoriesCollectionId,
      itemId: categoryId,
    })
    return data?.name
  }

  private async getAllItems(collectionId: string): Promise<BlogPost[]> {
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
        url: `${BlogPostsURL}/${item.slug}`,
        createdAt: item.createdOn,
        updatedAt: item.updatedOn,
        publishedOn: item.publishedOn,
        category: item.category5,
      }))
  }
}
