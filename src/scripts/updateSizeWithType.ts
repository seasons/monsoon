import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const addsManufacturerSizeToVariants = async () => {
  // Run this second
  const ps = new PrismaService()
  let count = 0
  try {
    const variants = await ps.binding.query.productVariants(
      {},
      `
      {
          id
          sku
          manufacturerSizes {
            id
          }
          internalSize {
            id
            display
            productType
            type
          }
      }
    `
    )

    for (const variant of variants) {
      const manuID = variant.manufacturerSizes?.[0]?.id

      if (!manuID) {
        const internalSize = variant.internalSize
        const sizeType = internalSize.type
        const sizeDisplay = internalSize.display

        const data = {
          display: sizeDisplay,
          productType: internalSize.productType,
          type: internalSize.type,
          slug: `${variant.sku}-manufacturer-${sizeType}-${sizeDisplay}`,
        }

        const size = await ps.client.createSize(data)

        await ps.client.updateProductVariant({
          where: { id: variant.id },
          data: {
            manufacturerSizes: {
              set: [{ id: size.id }],
            },
          },
        })
        count++
        console.log(`Updated ${count} of ${variants.length}`)
      } else {
        count++
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const addTypeToSizes = async () => {
  // Run this first
  const ps = new PrismaService()
  let count = 0
  const sizes = await ps.binding.query.sizes(
    {},
    `
    {
        id
        productType
        display
        bottom {
            id
            type
        }
    }
  `
  )

  for (const size of sizes) {
    let data = {}
    if (size.display.includes("EU ")) {
      const newDisplay = size.display.replace("EU ", "")
      data = {
        display: newDisplay,
      }
    }
    if (size.display.includes("JP ")) {
      const newDisplay = size.display.replace("JP ", "")
      data = {
        display: newDisplay,
      }
    }
    if (size?.bottom?.type && size.productType === "Bottom") {
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          ...data,
          type: size?.bottom?.type,
        },
      })
    } else if (size.productType === "Top") {
      await ps.client.updateSize({
        where: { id: size.id },
        data: {
          ...data,
          type: "Letter",
        },
      })
    }

    count++
    console.log(`Updated ${count} of ${sizes.length}`)
  }
}

addTypeToSizes()
