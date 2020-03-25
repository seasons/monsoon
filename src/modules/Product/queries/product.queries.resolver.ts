import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver()
export class ProductQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService
  ) {}

  @Query()
  async product(@Args() args, @Info() info) {
    return await this.prisma.binding.query.product(args, info)
  }

  @Query()
  async products(@Args() args, @Info() info) {
    return await this.productService.getProducts(args, info)
  }

  @Query()
  async productsConnection(@Args() args, @Info() info) {
    return await this.productService.getProductsConnection(args, info)
  }

  @Query()
  async productRequests(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productRequests(args, info)
  }

  @Query()
  async productFunctions(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productFunctions(args, info)
  }

  @Query()
  async categories(@Args() args, @Info() info) {
    return await this.prisma.binding.query.categories(args, info)
  }
}
