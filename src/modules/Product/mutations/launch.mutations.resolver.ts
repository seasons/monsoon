import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { LaunchService } from "../services/launch.service"

@Resolver("Launch")
export class LaunchMutationsResolver {
  constructor(private readonly launch: LaunchService) {}

  @Mutation()
  async upsertLaunch(@Args() { where, data }) {
    return await this.launch.upsertLaunch({ where, data })
  }
}
