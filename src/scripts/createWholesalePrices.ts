import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const products = await ps.client.product.findMany({
    select: {
      id: true,
      variants: {
        select: {
          physicalProducts: {
            select: {
              unitCost: true,
            },
          },
        },
      },
    },
  })

  let count = 0
  for (const product of products) {
    const variants = product.variants
    let maxPrice
    for (const variant of variants) {
      maxPrice = Math.max.apply(
        Math,
        variant.physicalProducts.map(p => p.unitCost)
      )
    }

    if (maxPrice) {
      count++
      await ps.client.product.update({
        where: {
          id: product.id,
        },
        data: {
          wholesalePrice: Math.ceil(maxPrice),
        },
      })
      console.log("count", count)
    }
  }
}
run()
