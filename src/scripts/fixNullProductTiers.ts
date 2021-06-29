import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const products = await ps.client2.product.findMany({
    select: {
      id: true,
      tier: {
        select: {
          id: true,
        },
      },
    },
  })

  const tier = await ps.client2.productTier.findFirst({
    where: { tier: "Standard" },
    select: {
      id: true,
    },
  })

  let count = 0

  for (const product of products) {
    if (!product.tier?.id && tier.id) {
      count++
      console.log("Updating: ", count)
      console.log("product: ", product)
      const result = await ps.client2.product.update({
        where: { id: product.id },
        data: {
          tier: { connect: { id: tier.id } },
        },
        select: {
          tier: {
            select: {
              id: true,
            },
          },
        },
      })
      console.log("result", result)
    }
  }
  console.log("finished")
}
run()
