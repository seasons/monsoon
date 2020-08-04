import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const productVariants = await ps.client.productVariants({
    where: { manufacturerSizes_some: { id_not: null } },
  })
  for (const variant of productVariants) {
    const variantWithSizes = await ps.binding.query.productVariant(
      { where: { id: variant.id } },
      `{
          id
          sku
          manufacturerSizes {
              id
              slug
              bottom {
                  id
                  type
                  value
              }
          }
      }`
    )
    const manufacturerSizes = variantWithSizes.manufacturerSizes
    manufacturerSizes.forEach(async size => {
      if (size.bottom) {
        const newSlug = `${variantWithSizes.sku}-manufacturer-${size.bottom.type}-${size.bottom.value}`
        await ps.client.updateSize({
          where: { id: size.id },
          data: { slug: newSlug },
        })
      } else {
        console.log("Did not update: ", size)
      }
    })
  }
}

run()
