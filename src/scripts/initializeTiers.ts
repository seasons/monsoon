import "module-alias/register"

import { ImageService } from "../modules/Image/services/image.service"
import { ProductService } from "../modules/Product/services/product.service"
import { ProductUtilsService } from "../modules/Product/services/product.utils.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const utils = new UtilsService(ps)
  const productUtilsService = new ProductUtilsService(ps, utils)
  const productService = new ProductService(
    ps,
    new ImageService(ps),
    productUtilsService,
    null,
    null,
    null
  )

  const allTiers = await (await ps.client.productTiers({})).map(a => a.tier)
  if (!allTiers.includes("Luxury") && !allTiers.includes("Standard")) {
    await ps.client.createProductTier({ tier: "Standard", price: 3500 })
    await ps.client.createProductTier({ tier: "Luxury", price: 4000 })
  }
  const allProds = await ps.client.products()
  let numStandard = 0
  let numLux = 0
  let i = 0
  for (const prod of allProds) {
    console.log(`${i++} of ${allProds.length}`)
    const tier = await productService.getProductTier(prod)
    if (tier.tier === "Standard") {
      numStandard += 1
    } else {
      numLux += 1
    }
    console.log(prod.slug, tier)
    await ps.client.updateProduct({
      where: { id: prod.id },
      data: { tier: { connect: { id: tier.id } } },
    })
  }
  console.log(`numStandard`, numStandard)
  console.log(`numLux`, numLux)
}

run()
