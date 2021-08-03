import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

import { BagService } from "../services/bag.service"
import { ProductService } from "../services/product.service"
import { ProductRequestService } from "../services/productRequest.service"

@Resolver()
export class ProductMutationsResolver {
  constructor(
    private readonly bagService: BagService,
    private readonly productRequestService: ProductRequestService,
    private readonly productService: ProductService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async addProductRequest(
    @Args() { reason, url },
    @User() user,
    @Select() select
  ) {
    if (!user) {
      throw new Error(`Can not add product request in logged out state`)
    }
    return await this.productRequestService.addProductRequest(
      reason,
      url,
      user,
      select
    )
  }

  @Mutation()
  async deleteBagItem(@Args() { itemID }, @Application() application) {
    if (application === "spring") {
      await this.bagService.deleteBagItemFromAdmin(itemID)
    } else {
      await this.prisma.client.bagItem.delete({ where: { id: itemID } })
    }
    return true
  }

  @Mutation()
  async addToBag(
    @Args() args,
    @Customer() customer,
    @Select() select,
    @Application() application
  ) {
    if (application === "spring") {
      const { customerID, item, status, saved } = args
      return await this.bagService.addBagItemFromAdmin(
        customerID,
        item,
        status,
        saved
      )
    } else {
      if (!customer) {
        throw new Error(`Can not add to bag without a logged in customer`)
      }
      const { item } = args
      return await this.bagService.addToBag(item, customer, select)
    }
  }

  @Mutation()
  async addViewedProduct(
    @Args() { item },
    @Customer() customer,
    @Select() select
  ) {
    return await this.productService.addViewedProduct(item, customer, select)
  }

  @Mutation()
  async createProduct(@Args() { input }, @Select() select) {
    return await this.productService.createProduct(input, select)
  }

  @Mutation()
  async saveProduct(
    @Args() { item, save = false },
    @Select() select,
    @Customer() customer
  ) {
    return await this.productService.saveProduct(item, save, select, customer)
  }

  @Mutation()
  async removeFromBag(
    @Args() { item, saved, customer: passedCustomerID },
    @Customer() customer
  ) {
    // TODO: removeFromBag has been deprecated, use deleteBagItem
    return await this.bagService.removeFromBag(
      item,
      saved,
      !!passedCustomerID ? { id: passedCustomerID } : customer
    )
  }

  @Mutation()
  async checkItemsAvailability(@Args() { items }, @Customer() customer) {
    return await this.productService.checkItemsAvailability(items, customer)
  }

  @Mutation()
  async updateProduct(@Args() { where, data }, @Select() select) {
    return await this.productService.updateProduct({ where, data, select })
  }

  @Mutation()
  async publishProducts(@Args() { productIDs }) {
    return await this.productService.publishProducts(productIDs)
  }
}
