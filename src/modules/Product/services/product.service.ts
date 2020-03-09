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
    const category = args.category || "all"
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []
    // Add filtering by sizes in query
    const where = args.where || {}
    if (sizes && sizes.length > 0) {
      where.variants_some = { size_in: sizes }
    }

    // If client wants to sort by name, we will assume that they
    // want to sort by brand name as well
    if (orderBy.includes("name_")) {
      return await this.productUtils.productsAlphabetically(
        category,
        orderBy,
        sizes
      )
    }

    if (args.category && args.category !== "all") {
      const category = await prisma.category({ slug: args.category })
      const children = await prisma.category({ slug: args.category }).children()

      const filter =
        children.length > 0
          ? {
              where: {
                ...args.where,
                OR: children.map(({ slug }) => ({ category: { slug } })),
              },
            }
          : {
              where: {
                ...args.where,
                category: { slug: category.slug },
              },
            }
      const { first, skip } = args
      const products = await this.db.query.products(
        { first, skip, orderBy, where, ...filter },
        info
      )
      return products
    }

    const result = await this.db.query.products(
      { ...args, orderBy, where },
      info
    )
    return result
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
