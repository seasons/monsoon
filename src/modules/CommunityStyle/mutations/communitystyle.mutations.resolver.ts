import { User } from "@app/decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { CommunityStyleService } from "../services/communitystyle.service"

@Resolver()
export class CommunityStyleMutationsResolver {
  constructor(private readonly communityStyleService: CommunityStyleService) {}

  @Mutation()
  async submitStyle(@Args("image") image, @User() user, @Info() info) {
    return this.communityStyleService.submitStyle(image, user, info)
  }

  @Mutation()
  async reportStyle(@Args() args, @User() user) {
    this.communityStyleService.reportStyle(args, user)
  }

  @Mutation()
  async approveStyle(@Args() args) {
    this.communityStyleService.approveStyle(args, true)
  }

  @Mutation()
  async deleteStyle(@Args() args) {
    this.communityStyleService.deleteStyle(args)
  }

  @Mutation()
  async unapproveStyle(@Args() args) {
    this.communityStyleService.approveStyle(args, false)
  }
}
