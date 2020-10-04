import { Injectable } from "@nestjs/common"
import { head } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

interface ProductGridItem {
  sizes: string
  name: string
  src: string
}

@Injectable()
export class EmailUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async getXLatestProducts(numProducts: number): Promise<ProductGridItem[]> {
    const xLatestProducts = await this.prisma.binding.query.products(
      {
        where: { status: "Available" },
        orderBy: "publishedAt_DESC",
        first: numProducts,
      },
      `
      {
      name
      variants {
        internalSize {
            display
        }
      }
      images {
        url
      }
    }
        `
    )
    return xLatestProducts.map(a => ({
      sizes: `${a.variants?.map(b => b.internalSize?.display)}`.replace(
        /,/g,
        " "
      ),
      src: head(a.images)?.url,
      name: a.name,
    }))
  }
}
