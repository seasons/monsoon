import { Select } from "@app/decorators/select.decorator"
import { LaunchService } from "@modules/Product/services/launch.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

@Resolver("Launch")
export class LaunchMutationsResolver {
  constructor(private readonly launch: LaunchService) {}

  @Mutation()
  async upsertLaunch(@Args() { where, data }, @Select() select) {
    return await this.launch.upsertLaunch({ where, data, select })
  }
}
