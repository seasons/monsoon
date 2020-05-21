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
  async processReservation(@Args() { data }) {
    const { reservationNumber, productStates } = data

    const receiptData = {
      reservation: {
        connect: {
          reservationNumber,
        },
      },
      items: {
        create: productStates
          .filter(a => a.returned)
          .map(productState => {
            return {
              product: {
                connect: {
                  seasonsUID: productState.productUID,
                },
              },
              productStatus: productState.productStatus,
              notes: productState.notes,
            }
          }),
      },
    }

    // Update status on physical products depending on whether
    // the item was returned
    await Promise.all(
      productStates.forEach(({ productUID, productStatus, returned }) => {
        const seasonsUID = productUID
        const updateData: any = {
          productStatus,
        }
        if (returned) {
          // TODO: allow inventory status to be overriden from admin but derive value
          // from automated criteria
          updateData.inventoryStatus = "Reservable"
          return this.prisma.client.updatePhysicalProduct({
            where: { seasonsUID },
            data: updateData,
          })
        }
      })
    )

    const result = await this.prisma.client.createReservationReceipt(
      receiptData
    )

    return result
  }
}
