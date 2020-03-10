import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
import { prisma, RecentlyViewedProduct, Product } from "../../../prisma"
import { AuthService } from "../../User/services/auth.service"
import { head } from "lodash"
import { ProductUtilsService } from "./product.utils.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly authService: AuthService,
    private readonly db: DBService,
    private readonly productUtils: ProductUtilsService
  ) {}

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
    const viewedProducts = await prisma.recentlyViewedProducts({
      where: {
        customer: { id: customer.id },
        product: { id: item },
      },
    })
    const viewedProduct: RecentlyViewedProduct = head(viewedProducts)

    if (viewedProduct) {
      return await prisma.updateRecentlyViewedProduct({
        where: {
          id: viewedProduct.id,
        },
        data: {
          viewCount: viewedProduct.viewCount++,
        },
      })
    } else {
      return await prisma.createRecentlyViewedProduct({
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
    const productVariants = await prisma.productVariants({
      where: {
        product: {
          id: product.id,
        },
      },
    })

    const bagItem = await prisma.bagItems({
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
}
