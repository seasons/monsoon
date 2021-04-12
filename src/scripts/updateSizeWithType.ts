import "module-alias/register"

import { size } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const addsManufacturerSizeToVariants = async () => {
  const ps = new PrismaService()
  let count = 0
  try {
    const variants = await ps.binding.query.productVariants(
      {},
      `
      {
          id
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
      const internalSize = variant.internalSize

      if (!manuID) {
        let data = {
          display: internalSize.display,
          productType: internalSize.productType,
          type: internalSize.type,
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
  const ps = new PrismaService()
  let count = 0
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

    count++
    console.log(`Updated ${count} of ${sizes.length}`)
  }
}

addTypeToSizes()
