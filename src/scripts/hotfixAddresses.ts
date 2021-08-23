import "module-alias/register"

import * as fs from "fs"

import { NestFactory } from "@nestjs/core"
import readlineSync from "readline-sync"

import { AppModule } from "../app.module"
import { ShippingService } from "../modules/Shipping/services/shipping.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const timeout = async ms => new Promise(resolve => setTimeout(resolve, ms))

const seed = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const ps = app.get(PrismaService)
  const shipping = app.get(ShippingService)

  const allActiveCustomers = await ps.client.customer.findMany({
    where: { status: "Active" },
    select: { detail: { include: { shippingAddress: true } } },
  })
  let total = allActiveCustomers.length
  let correct = 0
  let error = 0
  for (const c of allActiveCustomers) {
    console.log(`${correct} correct, ${error} wrong of ${total}`)
    try {
      await shipping.shippoValidateAddress(
        shipping.locationDataToShippoAddress(c.detail.shippingAddress)
      )
      correct++
    } catch (err) {
      if (err.message === "can not extract values from null object") {
        continue
      }
      error++
      console.log(
        shipping.locationDataToShippoAddress(c.detail.shippingAddress)
      )
      console.log(err)
      if (readlineSync.keyInYN(`Update address?`)) {
        const x = await ps.client.location.update({
          where: { id: c.detail.shippingAddress.id },
          data: {
            city: err.extensions.suggestedAddress.city,
            state: err.extensions.suggestedAddress.state,
            address1: err.extensions.suggestedAddress.street1,
            address2: err.extensions.suggestedAddress.street2,
            zipCode: err.extensions.suggestedAddress.zip,
          },
          select: { id: true },
        })
        console.log(`Location with id ${x.id} updated`)
      }
    }
  }
}

seed()
