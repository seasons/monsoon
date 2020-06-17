import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("Brand")
export class BrandMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async createBrand(@Args() { input }) {
    return await this.prisma.client.createBrand(input)
  }
}
