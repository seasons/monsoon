import { User } from "@app/decorators"
import { ReservationService } from "@modules/Reservation"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { ProductVariantService } from "../services/productVariant.service"

@Resolver("Brand")
export class BrandMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async createBrand(@Args() { input }) {
    console.log("DATA:", input)
    return await this.prisma.client.createBrand(input)
  }
}
