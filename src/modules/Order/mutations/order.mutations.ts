import { Customer, User } from "@app/decorators"
import { ProductVariantOrderService } from "@app/modules/Product/services/productVariantOrder.service"
import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("Order")
export class OrderMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productVariantOrderService: ProductVariantOrderService,
    private readonly shopify: ShopifyService
  ) {}

  @Mutation()
  async createDraftedOrder(
    @Args() { input: { orderType, productVariantId } },
    @Customer() customer,
    @User() user,
    @Info() info
  ) {
    if (orderType === "New") {
      return this.productVariantOrderService.buyNewCreateDraftedOrder({
        productVariantId,
        customer,
      })
    } else {
      const draftOrder = await this.productVariantOrderService.buyUsedCreateDraftedOrder(
        {
          productVariantId,
          customer,
          user,
          info,
        }
      )
      return draftOrder
    }
  }

  @Mutation()
  async submitOrder(
    @Args() { input: { orderId } },
    @Customer() customer,
    @User() user
  ) {
    const order = await this.prisma.client.order({ id: orderId })

    if (order.type === "New") {
      return this.productVariantOrderService.buyNewSubmitOrder({
        order,
        customer,
      })
    } else {
      return this.productVariantOrderService.buyUsedSubmitOrder({
        order,
        customer,
        user,
      })
    }
  }
}
