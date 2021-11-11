import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../app.module"
import { ProductUtilsService } from "../modules/Utils/services/product.utils.service"
import { PrismaService } from "../prisma/prisma.service"

const updatePrices = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const ps = app.get(PrismaService)
  const productUtils = app.get(ProductUtilsService)
  const productsToUpdate = await ps.client.product.findMany({
    where: {},
    select: {
      brand: { select: { name: true } },
      name: true,
      id: true,
      wholesalePrice: true,
      rentalPriceOverride: true,
      computedRentalPrice: true,
      recoupment: true,
      category: { select: { dryCleaningFee: true, recoupment: true } },
    },
  })

  let i = 0
  for (const prod of productsToUpdate) {
    console.log(`${i++} of ${productsToUpdate.length}`)
    try {
      const freshRentalPrice = productUtils.calcRentalPrice(prod, {
        ignoreOverride: true,
      })
      if (
        freshRentalPrice < prod.computedRentalPrice ||
        freshRentalPrice === prod.computedRentalPrice
      ) {
        //noop
      } else if (freshRentalPrice - prod.computedRentalPrice <= 10) {
        console.log(
          `Update ${prod.brand.name} -- ${prod.name} from ${
            prod.computedRentalPrice
          } to ${freshRentalPrice}. ${
            prod.rentalPriceOverride > 0
              ? "Adjust rental price override also."
              : ""
          }`
        )
        await ps.client.product.update({
          where: { id: prod.id },
          data: { computedRentalPrice: freshRentalPrice },
        })
        if (prod.rentalPriceOverride > 0) {
          await ps.client.product.update({
            where: { id: prod.id },
            data: { rentalPriceOverride: freshRentalPrice },
          })
        }
      } else {
        console.log(
          `Update ${prod.brand.name} -- ${prod.name} from ${
            prod.computedRentalPrice
          } to ${prod.computedRentalPrice + 10} (max 10 ceiling). ${
            prod.rentalPriceOverride > 0
              ? "Adjust rental price override also."
              : ""
          }`
        )
        await ps.client.product.update({
          where: { id: prod.id },
          data: { computedRentalPrice: prod.computedRentalPrice + 10 },
        })
        if (prod.rentalPriceOverride > 0) {
          await ps.client.product.update({
            where: { id: prod.id },
            data: { rentalPriceOverride: prod.computedRentalPrice + 10 },
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
}
updatePrices()
