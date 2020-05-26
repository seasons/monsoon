import { HttpService, Injectable } from "@nestjs/common"

const { WEBFLOW_KEY } = process.env

@Injectable()
export class BlogService {
  constructor(private httpService: HttpService) {}

  async getPosts({
    collectionId,
    limit,
  }: {
    collectionId: string
    limit?: number
  }) {
    const query = await this.httpService
      .get(
        `https://api.webflow.com/collections/${collectionId}/items?access_token=${WEBFLOW_KEY}&api_version=1.0.0`
      )
      .toPromise()

    const publishedPosts = query?.data?.items?.filter(post => {
      return !post._archived && !post._draft
    })

    if (limit) {
      return publishedPosts?.slice(0, limit)
    }

    return publishedPosts
  }
}
