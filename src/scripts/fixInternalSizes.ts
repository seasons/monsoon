import "module-alias/register"

import * as util from "util"

import zipcodes from "zipcodes"

import { DripService } from "../modules/Drip/services/drip.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const variants = await ps.binding.query.productVariants(
    {},
    `{
      id
      internalSize {
          id
          display
          type
          bottom {
              id
              value
          }
      }
  }`
  )
  let count = 0
  for (const variant of variants) {
    const internalSize = variant.internalSize
    const display = internalSize.display
    const type = internalSize.type
    const bottomValue = internalSize?.bottom?.value
    if (
      type === "WxL" &&
      display.length < 3 &&
      !!bottomValue &&
      bottomValue !== display
    ) {
      count++
      console.log(
        "ID: ",
        variant.id,
        " / Display: ",
        display,
        " vs BottomValue: ",
        bottomValue,
        " / ",
        count
      )

      await ps.client.updateSize({
        where: { id: internalSize.id },
        data: {
          display: bottomValue,
        },
      })
    }
  }
}
run()
