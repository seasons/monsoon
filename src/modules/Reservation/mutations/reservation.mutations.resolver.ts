import { Analytics, Customer, User } from "@app/decorators"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { ReservationService } from ".."

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async reserveItems(
    @Args() { items },
    @User() user,
    @Customer() customer,
    @Info() info,
    @Analytics() analytics
  ) {
    const returnData = await this.reservationService.reserveItems(
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
  async processReservation(
    @Args() { data },
    @User() user,
    @Customer() customer,
    @Info() info,
    @Analytics() analytics
  ) {
    console.log(JSON.stringify(data, null, 2))

    // TODO: update status on product variants
    const { receipt } = data

    // receipt: {
    //   reservation: {
    //     connect: {
    //       reservationNumber: data.reservationNumber,
    //     },
    //   },
    //   items: {
    //     create: data.products.map(product => {
    //       const productState = productStates[product.barcode]
    //       return {
    //         product: {
    //           connect: {
    //             seasonsUID: product.seasonsUID,
    //           },
    //         },
    //         productStatus: productState.productStatus,
    //         notes: productState.notes,
    //       }
    //     }),
    //   },
    // },

    Promise.all(
      receipt.items.create.forEach(({ product, productStatus }) => {
        const seasonsUID = product.connect.seasonsUID

        return this.prisma.client.updatePhysicalProduct({
          where: { seasonsUID },
          data: {
            productStatus,
            inventoryStatus: "Reservable",
          },
        })
      })
    )

    const result = await this.prisma.client.createReservationReceipt(receipt)
    console.log(result)
  }
}
