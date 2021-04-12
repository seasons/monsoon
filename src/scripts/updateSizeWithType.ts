import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const addsManufacturerSizeToVariants = async () => {
  const ps = new PrismaService()

  const variants = await ps.binding.query.productVariants(
    {},
    `
    {
        id
        manufacturerSizes {
          id
        }
        internalSize {
          productType
            id
            type
            bottom {
              id
              value
              type
            }
            top {
              id
            }
        }
    }
  `
  )

  for (const variant of variants) {
    // Fix for JP sizes
    if (size?.bottom?.type && size.productType === "Bottom") {
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          type: size?.bottom?.type,
        },
      })
    } else if (size.productType === "Top") {
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          type: "Letter",
        },
      })
    }
  }
}

const addTypeToSizes = async () => {
  const ps = new PrismaService()

  const sizes = await ps.binding.query.sizes(
    {},
    `
    {
        id
        productType
        bottom {
            id
            type
        }
    }
  `
  )

  for (const size of sizes) {
    // Fix for JP sizes
    if (size?.bottom?.type && size.productType === "Bottom") {
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          type: size?.bottom?.type,
        },
      })
    } else if (size.productType === "Top") {
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          type: "Letter",
        },
      })
    }
  }
}

addTypeToSizes()
