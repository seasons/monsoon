import { Resolver, Args, Context, Mutation, Info } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { User, Customer, Analytics } from "../../../nest_decorators"
import { ReservationService } from "../services/reservation.service"
import { DBService } from "../../../prisma/db.service"

@Resolver("Product")
export class ProductMutationsResolver {
  constructor(
    private readonly db: DBService,
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
    @Info() info,
    @Analytics() analytics
  ) {
    const returnData = this.reservationService.reserveItems(
      items,
      user,
      customer,
      info
    )

    // Track the selection
    analytics.track({
      userId: user.id,
      event: "Reserved Items",
      properties: {
        items,
      },
    })

    return returnData
  }

  @Mutation()
  async checkItemsAvailability(@Args() { items }, @Customer() customer) {
    return await this.productService.checkItemsAvailability(items, customer)
  }
}
