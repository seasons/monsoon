import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { AnalyticsService } from "../services/analytics.service"

@Resolver()
export class AnalyticsMutationsResolver {
  constructor(private readonly analytics: AnalyticsService) {}

  @Mutation()
  async createEmbedURL(@Args() { input: { type, index } }) {
    return this.analytics.createEmbedURL(type, index)
  }
}
