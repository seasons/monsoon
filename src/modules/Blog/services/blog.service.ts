import { Injectable } from "@nestjs/common"
import Webflow from "webflow-api"

const { WEBFLOW_KEY, WEBFLOW_SITE_ID } = process.env

@Injectable()
export class BlogService {
  private webflow = new Webflow({ token: WEBFLOW_KEY })

  async getCollections() {
    const result = await this.webflow.collections({ siteId: WEBFLOW_SITE_ID })
    return result
  }

  async getPosts({
    collectionId,
    skip,
    limit,
  }: {
    collectionId: string
    skip: number
    limit: number
  }) {
    const posts = await this.webflow.items({
      collectionId,
      skip,
      limit,
    })

    return posts
  }
}
