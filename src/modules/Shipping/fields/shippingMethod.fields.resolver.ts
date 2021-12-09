import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("ShippingMethod")
export class ShippingMethodFieldsResolver {
  static timeWindows = [
    {
      id: "1012",
      startTime: 10,
      endTime: 12,
      display: "10am - 12pm",
    },
    {
      id: "1315",
      startTime: 13,
      endTime: 15,
      display: "1pm - 3pm",
    },
    {
      id: "1517",
      startTime: 15,
      endTime: 17,
      display: "3pm - 5pm",
    },
  ]

  static getTimeWindow(id: string) {
    return ShippingMethodFieldsResolver.timeWindows.find(
      timeWindow => timeWindow.id === id
    )
  }

  @ResolveField()
  async timeWindows(@Parent() parent) {
    if (parent?.code === "Pickup") {
      return ShippingMethodFieldsResolver.timeWindows
    }

    return []
  }
}
