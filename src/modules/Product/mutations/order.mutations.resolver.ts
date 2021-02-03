import { Customer } from "@app/decorators"
import {
  OrderCreateInput,
  OrderItemCreateInput,
} from "@app/prisma/prisma.binding"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

@Resolver("Order")
export class OrderMutationsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Mutation()
  async createUsedOrder(@Args() { physicalProductID }, @Customer() customer) {
    const physicalProduct = await this.prisma.binding.query.physicalProduct(
      { where: { id: physicalProductID } },
      `
      {
          id
          price {
              buyUsedEnabled
              buyUsedPrice
          }

      }
      `
    )

    const orderItem: OrderItemCreateInput = {
      recordID: physicalProduct.id,
      recordType: "PhysicalProduct",
      // TODO: logic for needs shipping
      needShipping: false,
      price: physicalProduct.price.buyUsedPrice,
      currencyCode: "USD",
    }

    const data: OrderCreateInput = {
      orderNumber: Math.floor(Math.random() * 900000000) + 100000000,
      type: "Used",
      customer: {
        connect: {
          id: customer.id,
        },
      },
      status: "Drafted",
      items: {
        create: orderItem,
      },
      // status: OrderStatus
      // subTotal: Int
      // total: Int
      // cancelReason: OrderCancelReason
      // couponID: String
      // paymentStatus: OrderPaymentStatus
      // note: String
      // customer: CustomerCreateOneInput!
      // sentPackage: PackageCreateOneInput
      // items: OrderItemCreateManyInput
    }

    return await this.prisma.binding.mutation.createOrder({ data })
  }

  @Mutation()
  async createOrder(@Args() { data: input }: { data: OrderCreateInput }) {}
}
