import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { LocationService } from "../services/location.service"

@Resolver("Location")
export class LocationFieldsResolver {
  constructor(private readonly location: LocationService) {}

  @ResolveField()
  async weatherDisplay(@Parent() location) {
    return this.location.temperatureWithEmoji(location.id)
  }
}
