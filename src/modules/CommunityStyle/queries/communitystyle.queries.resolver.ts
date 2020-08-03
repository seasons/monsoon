import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { CommunityStyleService } from "../services/communitystyle.service"

@Resolver()
export class CommunityStyleQueriesResolver {
  constructor(private readonly communityStyleService: CommunityStyleService) {}

  @Query()
  async communityStyle(@Info() info) {
    return this.communityStyleService.communityStyle(info)
  }

  @Query()
  async unapprovedStyleSubmissions(@Args() args, @Info() info) {
    return this.communityStyleService.unapprovedStyleSubmissions(args, info)
  }

  @Query()
  async communityStyleReports(@Args() args, @Info() info) {
    return this.communityStyleService.communityStyleReports(args, info)
  }
}
