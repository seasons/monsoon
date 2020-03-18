import { Resolver, Args, Mutation, Info } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { User, Customer, Analytics } from "../../../nest_decorators"
import { ReservationService } from "../services/reservation.service"
import { BagService } from "../services/bag.service"
import { ProductRequestService } from "../services/productRequest.service"

@Resolver()
export class ProductMutationsResolver {
  constructor(
    private readonly bagService: BagService,
    private readonly productService: ProductService,
    private readonly productRequestService: ProductRequestService,
    private readonly reservationService: ReservationService
  ) { }

  @Mutation()
  async addProductRequest(@Args() { reason, url }, @User() user) {
    return await this.productRequestService.addProductRequest(reason, url, user)
  }

  @Mutation()
  async addToBag(@Args() { item }, @Customer() customer) {
    return await this.bagService.addToBag(item, customer)
  }

  @Mutation()
  async addViewedProduct(@Args() { item }, @Customer() customer) {
    return await this.productService.addViewedProduct(item, customer)
  }

  @Mutation()
  async deleteProductRequest(@Args() { requestId }) {
    return await this.productRequestService.deleteProductRequest(requestId)
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
