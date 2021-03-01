import "module-alias/register"

import { head } from "lodash"

import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)

  const productVariants = await ps.binding.query.productVariants(
    {},
    `{
      id
      sku
      displayShort
      internalSize {
        id
        display
        bottom {
          id
          value
          type
        }
        top {
          id
          letter
        }
      }
      manufacturerSizes {
        id
        display
        bottom {
          id
          value
          type
        }
        top {
          id
          letter
        }
      }
  }`
  )

  const sizeConversion = utils.parseJSONFile(
    "src/modules/Product/sizeConversion"
  )

  let count = 0

  for (const variant of productVariants) {
    const internalSize = variant.internalSize
    const manufacturerSizes = variant.manufacturerSizes
    const manufacturerSize = head(manufacturerSizes)

    let displayShort
    // If top exit early because we are only using internalSizes for tops
    if (!!internalSize.top) {
      displayShort = internalSize.top.letter
    } else if (manufacturerSize) {
      const manufacturerSizeBottomType = manufacturerSize.bottom.type
      if (
        manufacturerSizeBottomType === "EU" ||
        manufacturerSizeBottomType === "JP"
      ) {
        displayShort =
          sizeConversion.bottoms?.[manufacturerSizeBottomType][
            manufacturerSize?.bottom?.value
          ]
      } else {
        displayShort = manufacturerSize.display
      }
    } else {
      displayShort = internalSize.display
    }

    if (!displayShort) {
      console.log("Missing displayShort on variant: ", variant.id)
    }

    if (displayShort !== variant.displayShort) {
      count++
      console.log(
        "SKU: ",
        variant.sku,
        " / Old displayshort: ",
        variant.displayShort,
        " / new display short: ",
        displayShort
      )
    }
    // await ps.client.updateProductVariant({
    //   where: { id: variant.id },
    //   data: { displayShort },
    // })
  }

  console.log(`Total: ${count}`)
}

run()
