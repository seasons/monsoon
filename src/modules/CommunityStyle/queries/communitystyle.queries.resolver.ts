import { Info, Query, Resolver } from "@nestjs/graphql"

import { CommunityStyleService } from "../services/communitystyle.service"

@Resolver()
export class CommunityStyleQueriesResolver {
  constructor(private readonly communityStyleService: CommunityStyleService) {}

  @Query()
  async communityStyle(@Info() info) {
    return this.communityStyleService.communityStyle(info)
  }
}
