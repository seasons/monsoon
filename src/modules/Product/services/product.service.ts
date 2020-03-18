import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/db.service"
import { RecentlyViewedProduct, BagItem } from "../../../prisma"
import { head } from "lodash"
import { ProductUtilsService } from "./product.utils.service"
import { PrismaClientService } from "../../../prisma/client.service"
import { ProductVariantService } from "./productVariant.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService
  ) { }

  async getProducts(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.db.query.products({ ...args, ...queryOptions }, info)
  }

  async getProductsConnection(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.db.query.productsConnection(
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

  async isSaved(product, customer) {
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

  async saveProduct(item, save, customer, info) {
    const bagItems = await this.db.query.bagItems(
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

    if (save && !bagItem) {
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
    } else {
      if (bagItem) {
        await this.prisma.client.deleteBagItem({
          id: bagItem.id,
        })
      }
    }

    if (save) {
      return this.db.query.bagItem(
        {
          where: {
            id: bagItem.id,
          },
        },
        info
      )
    }

    return bagItem
  }

  async checkItemsAvailability(items, customer) {
    const reservedBagItems = await this.db.query.bagItems(
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
}
