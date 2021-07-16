import { CollectionService } from "@modules/Collection/services/collection.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

@Resolver()
export class CollectionMutationsResolver {
  constructor(private readonly collection: CollectionService) {}

  @Mutation()
  async upsertCollection(@Args() args) {
    return this.collection.upsertCollection(args)
  }
}
