import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { CollectionService } from "../services/collection.service"

@Resolver()
export class CollectionMutationsResolver {
  constructor(private readonly collection: CollectionService) {}

  @Mutation()
  async upsertCollection(@Args() args) {
    return this.collection.upsertCollection(args)
  }
}
