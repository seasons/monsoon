import { Injectable } from "@nestjs/common"

import { LookerService } from "./looker.service"

@Injectable()
export class AnalyticsService {
  constructor(private readonly looker: LookerService) {}

  async createEmbedURL(type, index) {
    const { url } = await this.looker.client.ok(
      this.looker.client.create_sso_embed_url({
        target_url: `${this.looker.baseURL()}/${this.urlEncodeViewType(
          type
        )}/${index}`,
        permissions: [
          "see_lookml_dashboards",
          "access_data",
          "see_looks",
          "see_user_dashboards",
        ],
        models: ["seasonsnyc"],
        force_logout_login: true,
      })
    )
    return url
  }

  private urlEncodeViewType(type: "Dashboard" | "Look") {
    return `${type.toLowerCase()}s`
  }
}
