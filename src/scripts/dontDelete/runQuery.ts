import "module-alias/register"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const drip = new DripService()

  const jqmuProductVariants = await ps.client.productVariants({
    where: { sku_contains: "JQMU" },
    orderBy: "createdAt_ASC",
  })
  const jqmuProducts = await ps.binding.query.products(
    {
      where: { slug_contains: "jqmu" },
    },
    `{
      id
      slug
      variants {
        id
        sku 
      }
  }`
  )
  for (const p of jqmuProducts) {
    console.log(
      p.slug,
      p.variants.map(a => a.sku)
    )
  }
  // const email = await this.prisma.client.user({ id }).email()
  // console.log(allUnsubscribedCustomers)
  // console.log(allUnsubscribedCustomers.)
}

run()
