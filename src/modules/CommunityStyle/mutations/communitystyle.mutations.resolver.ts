import { User } from "@app/decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { CommunityStyleService } from "../services/communitystyle.service"

@Resolver()
export class CommunityStyleMutationsResolver {
  constructor(private readonly communityStyleService: CommunityStyleService) {}

  @Mutation()
  async submitStyle(@Args() args, @User() user) {
    return this.communityStyleService.submitStyle(args, user)
  }

  @Mutation()
  async reportStyle(@Args() args, @User() user) {
    return this.communityStyleService.reportStyle(args, user)
  }

  @Mutation()
  async approveStyle(@Args() args) {
    return this.communityStyleService.approveStyle(args, true)
  }

  @Mutation()
  async deleteStyle(@Args() args) {
    return this.communityStyleService.deleteStyle(args)
  }

  @Mutation()
  async unapproveStyle(@Args() args) {
    return this.communityStyleService.approveStyle(args, false)
  }
}
