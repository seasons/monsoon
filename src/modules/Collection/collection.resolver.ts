import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { PrismaService } from "../../prisma/prisma.service"

@Resolver("Collection")
export class CollectionResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async collections(@Args() args, @Info() info) {
    return await this.prisma.query.collections(args, info)
  }

  @Query()
  async collection(@Args() args, @Info() info) {
    return await this.prisma.query.collection(args, info)
  }
}
