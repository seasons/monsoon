import "module-alias/register"

import { groupBy } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allProducts = (await ps.binding.query.products(
    {
      where: {
        AND: [{ type: "Top" }, { variants_some: { reservable_gte: 1 } }],
      },
    },
    `{
    id
    type
    variants {
      reservable
      internalSize {
        display
      }
    }
  }`
  )) as any[]
  debugger
  const productsBySize = groupBy(
    allProducts,
    a => a.variants?.internalSize?.display
  )
  console.log(productsBySize)
}

run()
