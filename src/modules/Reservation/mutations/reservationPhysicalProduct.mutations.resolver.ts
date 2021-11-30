import { Select } from "@app/decorators/select.decorator"
import { BagService } from "@app/modules/Product/services/bag.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { ReservationPhysicalProductService } from "../services/reservationPhysicalProduct.service"

@Resolver()
export class ReservationPhysicalProductMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationPhysicalProduct: ReservationPhysicalProductService,
    private readonly bag: BagService
  ) {}

  @Mutation()
  async processReturn(
    @Args() { trackingNumber, productStates, droppedOffBy, customerId }
  ) {
    return this.reservationPhysicalProduct.processReturn({
      productStates,
      droppedOffBy,
      trackingNumber,
      customerId,
    })
  }

  @Mutation()
  async pickItems(@Args() { bagItemIDs }, @Select() select) {
    return this.reservationPhysicalProduct.pickItems({
      bagItemIDs,
      select,
    })
  }

  @Mutation()
  async packItems(@Args() { bagItemIDs }, @Select() select) {
    return this.reservationPhysicalProduct.packItems({
      bagItemIDs,
      select,
    })
  }

  @Mutation()
  async generateShippingLabels(@Args() { bagItemIDs }, @Select() select) {
    return this.reservationPhysicalProduct.generateShippingLabels({
      bagItemIDs,
      select,
    })
  }

  @Mutation()
  async updateReservationPhysicalProduct(@Args() { where, data }) {
    return this.prisma.client.reservationPhysicalProduct.update({
      where,
      data,
    })
  }

  @Mutation()
  async markAsLost(@Args() { lostBagItemId }) {
    return await this.bag.markAsLost(lostBagItemId)
  }

  @Mutation()
  async markAsPickedUp(@Args() { bagItemIds }) {
    return await this.reservationPhysicalProduct.markAsPickedUp(bagItemIds)
  }
}
