import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const sizes = await ps.client.sizes()

  for (const size of sizes) {
    // Fix for JP sizes
    if (size.display.includes("JP ")) {
      const newDisplay = size.display.replace("JP ", "")
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          display: newDisplay,
        },
      })
    }
  }

  const variants = await ps.client.productVariants()

  for (const variant of variants) {
    // Fix for JP sizes
    if (variant.displayShort.includes("JP ")) {
      const newDisplay = variant.displayShort.replace("JP ", "")
      await ps.client.updateProductVariant({
        where: { id: variant.id },
        data: {
          displayShort: newDisplay,
        },
      })
    }
  }
}

run()
