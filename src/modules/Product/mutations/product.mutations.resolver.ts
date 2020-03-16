import { Resolver, Args, Mutation, Info } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { Customer } from "../../../nest_decorators"
import { ReservationService } from "../services/reservation.service"
import { DBService } from "../../../prisma/db.service"
import { BagService } from "../services/bag.service"

@Resolver()
export class ProductMutationsResolver {
  constructor(
    private readonly bagService: BagService,
    private readonly productService: ProductService
  ) {}

  @Mutation()
  async addToBag(@Args() { item }, @Customer() customer) {
    return await this.bagService.addToBag(item, customer)
  }

  @Mutation()
  async addViewedProduct(@Args() { item }, @Customer() customer) {
    return await this.productService.addViewedProduct(item, customer)
  }

  @Mutation()
  async saveProduct(
    @Args() { item, save = false },
    @Info() info,
    @Customer() customer
  ) {
    return await this.productService.saveProduct(item, save, info, customer)
  }

  @Mutation()
  async removeFromBag(@Args() { item, saved }, @Customer() customer) {
    return await this.bagService.removeFromBag(item, saved, customer)
  }

  @Mutation()
  async checkItemsAvailability(@Args() { items }, @Customer() customer) {
    return await this.productService.checkItemsAvailability(items, customer)
  }
}
