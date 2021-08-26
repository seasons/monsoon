import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { BagItemStatus } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import slugify from "slugify"

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
  async swapBagItem(
    @Args() { oldItemID, physicalProductWhere },
    @Application() application
  ) {
    if (application !== "spring") {
      throw new Error("Can only swap bag items from Admin")
    }
    const physicalProductForSwap = await this.prisma.client.physicalProduct.findUnique(
      {
        where: {
          seasonsUID: physicalProductWhere.seasonsUID,
        },
        select: { id: true, inventoryStatus: true, seasonsUID: true },
      }
    )
    if (physicalProductForSwap.inventoryStatus !== "Reservable") {
      throw new Error("This item is not reservable")
    }

    return await this.bagService.swapBagItem(oldItemID, physicalProductForSwap)
  }

  @Mutation()
  async addToBag(@Args() args, @Customer() customer, @Select() select) {
    if (!customer) {
      throw new Error(`Can not add to bag without a logged in customer`)
    }
    const { item } = args
    return await this.bagService.addToBag(item, customer, select)
  }

  @Mutation()
  async upsertCategory(@Args() { where, data }, @Select() select) {
    const cat = await this.prisma.client.category.upsert({
      where,
      create: { ...data, slug: slugify(data.name).toLowerCase() },
      update: data,
      select,
    })
    return cat
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
