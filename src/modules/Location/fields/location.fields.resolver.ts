import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { LocationService } from "../services/location.service"

@Resolver("Location")
export class LocationFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly location: LocationService
  ) {}

  @ResolveField()
  async weather(@Parent() location) {
    return this.location.weather(location.id)
  }

  @ResolveField()
  async shippingOptions(@Parent() location) {
    const methods = await this.prisma.client.shippingMethod.findMany({})

    const options = methods.map(method => {
      return {
        id: method.id,
        averageDuration: 3,
        externalCost: 0,
        shippingMethod: method,
      }
    })
    return options
  }
}
