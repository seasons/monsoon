import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { sortBy } from "lodash"

import { LocationService } from "../services/location.service"

@Resolver("Location")
export class LocationFieldsResolver {
  constructor(private readonly location: LocationService) {}

  @ResolveField()
  async weather(@Parent() location) {
    return this.location.weather(location.id)
  }

  @ResolveField()
  async shippingOptions(@Parent() location) {
    return sortBy(location?.shippingOptions || [], a => a.externalCost)
  }
}
