import { Resolver, Args, Context, Mutation, Info } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { User, Customer } from "../../../nest_decorators"
import { ApolloError } from "apollo-server"
import { ReservationService } from "../services/reservation.service"

@Resolver("Product")
export class ProductMutationsResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly reservationService: ReservationService
  ) {}

  @Mutation()
  async addViewedProduct(@Args() { item }, @Context() ctx) {
    return await this.productService.addViewedProduct(item, ctx)
  }

  @Mutation()
  async reserveItems(
    @Args() { items },
    @User() user,
    @Customer() customer,
    @Info() info
  ) {
    return this.reservationService.reserveItems(items, user, customer, info)
  }
}
