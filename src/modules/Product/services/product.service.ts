import {
  BagItem,
  Customer,
  ID_Input,
  Product,
  ProductStatus,
  RecentlyViewedProduct,
} from "@prisma/index"
import {
  ProductUpdateInput,
  ProductWhereUniqueInput,
} from "@prisma/prisma.binding"
import { head, union } from "lodash"

import { GraphQLResolveInfo } from "graphql"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"
import { UtilsService } from "../../Utils/services/utils.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService
  ) {}

  async getProducts(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.prisma.binding.query.products(
      { ...args, ...queryOptions },
      info
    )
  }

  async getProductsConnection(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.prisma.binding.query.productsConnection(
      { ...args, ...queryOptions },
      info
    )
  }

  async addViewedProduct(item, customer) {
    const viewedProducts = await this.prisma.client.recentlyViewedProducts({
      where: {
        customer: { id: customer.id },
        product: { id: item },
      },
    })
    const viewedProduct: RecentlyViewedProduct = head(viewedProducts)

    if (viewedProduct) {
      return await this.prisma.client.updateRecentlyViewedProduct({
        where: {
          id: viewedProduct.id,
        },
        data: {
          viewCount: viewedProduct.viewCount++,
        },
      })
    } else {
      return await this.prisma.client.createRecentlyViewedProduct({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        product: {
          connect: {
            id: item,
          },
        },
        viewCount: 1,
      })
    }
  }

  async isSaved(
    product: { id: ID_Input } | Product,
    customer: { id: ID_Input } | Customer | null
  ) {
    if (!customer) {
      return false
    }
    const productVariants = await this.prisma.client.productVariants({
      where: {
        product: {
          id: product.id,
        },
      },
    })

    const bagItem = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id_in: productVariants.map(a => a.id),
        },
        saved: true,
      },
    })

    return bagItem.length > 0
  }

  async saveProduct(item, save, info, customer) {
    const bagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id: item,
          },
          saved: true,
        },
      },
      info
    )
    let bagItem: BagItem = head(bagItems)

    if (bagItem && !save) {
      await this.prisma.client.deleteBagItem({
        id: bagItem.id,
      })
    } else if (!bagItem && save) {
      bagItem = await this.prisma.client.createBagItem({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        productVariant: {
          connect: {
            id: item,
          },
        },
        position: 0,
        saved: save,
        status: "Added",
      })
    }

    if (save) {
      return this.prisma.binding.query.bagItem(
        {
          where: {
            id: bagItem.id,
          },
        },
        info
      )
    }

    return bagItem ? bagItem : null
  }

  async checkItemsAvailability(items, customer) {
    const reservedBagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id_in: items,
          },
          status_not: "Added",
        },
      },
      `{
        productVariant {
          id
        }
      }`
    )

    const reservedIds = reservedBagItems.map(a => a.productVariant.id)
    const newItems = items.filter(a => !reservedIds.includes(a))

    await this.productVariantService.updateProductVariantCounts(newItems, {
      dryRun: true,
    })

    return true
  }

  async getGeneratedVariantSKUs({ input }) {
    const { brandID, colorID, sizeNames } = input
    const brand = await this.prisma.client.brand({ id: brandID })
    const color = await this.prisma.client.color({ id: colorID })

    if (!brand || !color) {
      return null
    }

    const brandCount = await this.prisma.client
      .productsConnection({
        where: { brand: { id: brandID } },
      })
      .aggregate()
      .count()
    if (brandCount === null) {
      return null
    }

    const styleNumber = brandCount + 1
    const styleCode = styleNumber.toString().padStart(3, "0")
    return sizeNames.map(sizeName => {
      const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
      return `${brand.brandCode}-${color.colorCode}-${sizeCode}-${styleCode}`
    })
  }

  async updateProduct(
    where: ProductWhereUniqueInput,
    { status, ...data }: ProductUpdateInput,
    info: GraphQLResolveInfo
  ) {
    await this.storeProductIfNeeded(where, status)
    return await this.prisma.binding.mutation.updateProduct(
      {
        where,
        data: { status, ...data },
      },
      info
    )
  }

  async yo() {
    console.log(await this.prisma.client.products())
  }
  private async storeProductIfNeeded(
    where: ProductWhereUniqueInput,
    status: ProductStatus
  ) {
    const productBeforeUpdate = await this.prisma.binding.query.product(
      {
        where,
      },
      `{
          id
          status
          variants {
            id
            total
            offloaded
            physicalProducts {
              productStatus
              seasonsUID
            }
          }
        }`
    )
    if (status === "Stored" && productBeforeUpdate.status !== "Stored") {
      // Update counts on downstream product variants
      for (const prodVar of productBeforeUpdate.variants) {
        await this.prisma.client.updateProductVariant({
          where: { id: prodVar.id },
          data: {
            nonReservable: prodVar.total - prodVar.offloaded,
            reservable: 0,
            reserved: 0,
          },
        })
      }

      // Update statuses on downstream physical products
      const downstreamPhysProds = productBeforeUpdate.variants.reduce(
        (acc, curVal) => union(acc, curVal.physicalProducts),
        []
      )
      for (const { productStatus, seasonsUID } of downstreamPhysProds) {
        if (productStatus !== "Offloaded") {
          await this.prisma.client.updatePhysicalProduct({
            where: { seasonsUID },
            data: { productStatus: "Stored", inventoryStatus: "NonReservable" },
          })
        }
      }
    }
  }
}
