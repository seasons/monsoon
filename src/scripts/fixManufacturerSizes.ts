import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const sizes = await ps.client.sizes()

  for (const size of sizes) {
    // Fix for Letter sizes
    if (size.display.includes("US ")) {
      const newDisplay = size.display.replace("US ", "")
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
    // Fix for Letter sizes
    if (variant.displayShort.includes("US ")) {
      const newDisplay = variant.displayShort.replace("US ", "")
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
