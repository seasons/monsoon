import { Query, Resolver, Args, Info, Context } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { DBService } from "../../../prisma/db.service"
import { addFragmentToInfo } from "graphql-binding"

@Resolver()
export class ProductQueriesResolver {
  constructor(
    private readonly db: DBService,
    private readonly productService: ProductService
  ) {}

  @Query()
  async product(@Args() args, @Info() info, @Context() ctx) {
    const fragment = `fragment EnsureId on Product { id }` // for computed fields
    return await this.db.query.product(args, addFragmentToInfo(info, fragment))
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
    return await this.db.query.productRequests(args, info)
  }

  @Query()
  async productFunctions(@Args() args, @Info() info) {
    return await this.db.query.productFunctions(args, info)
  }

  @Query()
  async categories(@Args() args, @Info() info) {
    return await this.db.query.categories(args, info)
  }
}
