import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { ReservationFeedbackService } from "../services/reservationFeedback.service"
import { DBService } from "../../../prisma/db.service"
import { User } from "../../../nest_decorators"

@Resolver("Product")
export class ProductQueriesResolver {
  constructor(
    private readonly db: DBService,
    private readonly productService: ProductService,
    private readonly reservationFeedbackService: ReservationFeedbackService,
  ) { }

  @Query()
  async product(@Args() args, @Info() info) {
    return await this.db.query.product(args, info)
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

  @Query()
  async reservationFeedback(@User() user) {
    return await this.reservationFeedbackService.getReservationFeedback(user)
  }
}
