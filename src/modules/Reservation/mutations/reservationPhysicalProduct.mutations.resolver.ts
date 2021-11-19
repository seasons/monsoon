import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

@Resolver()
export class ReservationPhysicalProductMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}
  @Mutation()
  async updateReservationPhysicalProduct(@Args() { where, data }) {
    return this.prisma.client.reservationPhysicalProduct.update({
      where,
      data,
    })
  }
}
