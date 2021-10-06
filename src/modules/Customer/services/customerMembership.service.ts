import { RentalService } from "@app/modules/Payment/services/rental.service"
import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class CustomerMembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rental: RentalService,
    private readonly productUtils: ProductUtilsService
  ) {}

  async calculateCurrentBalance(
    customerId: string,
    options: { upTo?: "today" | "billingEnd" | null } = { upTo: null }
  ) {
    const currentInvoice = await this.prisma.client.rentalInvoice.findFirst({
      where: {
        membership: {
          customerId,
        },
        status: "Draft",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        products: {
          select: {
            id: true,
            seasonsUID: true,
            productVariant: {
              select: {
                product: {
                  select: {
                    id: true,
                    computedRentalPrice: true,
                    rentalPriceOverride: true,
                    wholesalePrice: true,
                    recoupment: true,
                    category: {
                      select: {
                        dryCleaningFee: true,
                        recoupment: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const rentalPrices = []

    for (const product of currentInvoice.products) {
      const { daysRented } = await this.rental.calcDaysRented(
        currentInvoice,
        product,
        { upTo: options.upTo }
      )

      const rentalPriceForDaysUntilToday = this.rental.calculatePriceForDaysRented(
        product.productVariant.product,
        daysRented
      )

      rentalPrices.push(rentalPriceForDaysUntilToday)
    }

    console.log(rentalPrices)

    return rentalPrices.reduce((a, b) => a + b, 0)
  }
}
