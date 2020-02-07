import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { PrismaService } from "../../prisma/prisma.service"
import { Product } from "../../prisma"

@Resolver()
export class ProductResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query("products")
  async getProducts(@Args() args, @Info() info): Promise<Product[]> {
    return await this.prisma.query.products(args, info)
  }
}
