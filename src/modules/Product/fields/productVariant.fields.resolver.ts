import { Resolver, ResolveProperty, Context, Parent } from "@nestjs/graphql"
import { PrismaClientService } from "../../../prisma/client.service"
import { Customer, User } from "../../../nest_decorators"
import { DBService } from "../../../prisma/db.service"

@Resolver("ProductVariant")
export class ProductVariantFieldsResolver {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService
  ) {}

  @ResolveProperty()
  async isSaved(@Parent() parent, @Customer() customer) {
    if (!customer) return false

    const bagItems = await this.prisma.client.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        customer: {
          id: customer.id,
        },
        saved: true,
      },
    })

    return bagItems.length > 0
  }

  @ResolveProperty()
  async isWanted(@Parent() parent, @User() user) {
    if (!user) return false

    const productVariant = await this.prisma.client.productVariant({
      id: parent.id,
    })
    if (!productVariant) {
      return false
    }

    const productVariantWants = await this.prisma.client.productVariantWants({
      where: {
        user: {
          id: user.id,
        },
        AND: {
          productVariant: {
            id: productVariant.id,
          },
        },
      },
    })

    const exists = productVariantWants && productVariantWants.length > 0
    return exists
  }

  @ResolveProperty()
  async size(@Parent() parent) {
    const productVariant = await this.db.query.productVariant(
      {
        where: {
          id: parent.id,
        },
      },
      `
    {
      id
      internalSize {
        top {
          letter
        }
        bottom {
          id
          type
          value
        }
        display
        productType
      }
    }
    `
    )
    return productVariant.display
  }
}
