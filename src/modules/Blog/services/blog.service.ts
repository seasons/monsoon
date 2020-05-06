import { Injectable } from "@nestjs/common"
import Webflow from "webflow-api"

const { WEBFLOW_KEY, WEBFLOW_COLLECTION_ID } = process.env

@Injectable()
export class BlogService {
  private webflow = new Webflow({ token: WEBFLOW_KEY })

  async getCollections() {
    const result = await this.webflow.collections({
      siteId: WEBFLOW_COLLECTION_ID,
    })
    return result
  }

  async getPosts({
    collectionId,
    limit,
  }: {
    collectionId: string
    limit?: number
  }) {
    const allPosts = await this.webflow.items({
      collectionId,
    })

    const publishedPosts = allPosts?.items?.filter(post => {
      return !post._archived && !post._draft
    })

    if (limit) {
      return publishedPosts.slice(0, limit)
    }

    return publishedPosts
  }
}
