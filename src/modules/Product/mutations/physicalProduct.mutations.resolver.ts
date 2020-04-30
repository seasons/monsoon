import { User } from "@app/nest_decorators"
import { Args, Mutation, Resolver, Info } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("")
export class PhysicalProductMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async updatePhysicalProduct(@Args() { where, data }, @Info() info) {}
}
