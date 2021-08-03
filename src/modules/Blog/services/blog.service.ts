import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { head, pick } from "lodash"
import moment from "moment"

import { BlogPost } from "../blog.types.d"
import {
  AuthorsCollectionId,
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
    const publishedPosts = await this.getAllItems()

    if (limit) {
      return publishedPosts?.slice(0, limit)
    }

    return publishedPosts
  }

  async getLastPost(): Promise<BlogPost> {
    const publishedPosts = await this.getAllItems()

    // published posts in order of most recently updated
    publishedPosts.sort((a, b) => {
      const timeA = moment(a.updatedAt)
      const timeB = moment(b.updatedAt)
      return timeA.isAfter(timeB) ? -1 : 1
    })

    return head(publishedPosts)
  }

  async getItem(itemId, query = {}): Promise<BlogPost> {
    return this.webflow.client.item(
      { collectionId: BlogPostsCollectionId, itemId },
      query
    )
  }

  async getAllItems(): Promise<BlogPost[]> {
    const allPosts = []
    let offset = 0
    while (true) {
      const data = await this.webflow.client.items(
        { collectionId: BlogPostsCollectionId },
        { offset }
      )
      allPosts.push(...data?.items)
      offset = data?.offset
      if (!offset) {
        break
      }
    }

    const categories = await this.webflow.client.items({
      collectionId: CategoriesCollectionId,
    })

    const authors = await this.webflow.client.items({
      collectionId: AuthorsCollectionId,
    })

    const getCategory = categoryID => {
      const category = categories?.items?.find(cat => {
        return cat._id === categoryID
      })
      return category?.name || ""
    }

    const getAuthor = authorID => {
      const author = authors?.items?.find(auth => {
        return auth._id === authorID
      })
      return author?.name || ""
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
        category: getCategory(item.category5),
        author: getAuthor(item.author4),
      }))
  }
}
