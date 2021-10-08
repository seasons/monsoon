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
    select: {
      detail: { include: { shippingAddress: true } },
      user: { select: { email: true } },
    },
  })
  let total = allActiveCustomers.length
  let correct = 0
  let error = 0
  let ignored = 0
  const ignores = [
    "tr.elc3@gmail.com",
    "dylankravetz@gmail.com",
    "jordanwspencer@gmail.com",
    "conor.holihan@gmail.com",
    "alexxandersonmedia@gmail.com",
    "andrew.r.hooker@gmail.com",
    "adam.j.masters@gmail.com",
    "sasspr@hotmail.com",
    "trey.b@me.com",
    "lpz_eric@yahoo.com",
    "mrchristianlaw@gmail.com",
    "mmagpili@gmail.com",
    "vanmarter3@gmail.com",
    "nabor101@gmail.com",
    "jerinv06@gmail.com",
    "retail.drake@gmail.com",
    "garethjwest@gmail.com",
    "rgarcia0223@yahoo.com",
    "ryan.swanger@gmail.com",
    "tcjohns7@ncsu.edu",
    "jbrown1564@gmail.com",
    "jabbar@me.com",
    "denzelmoone@gmail.com",
    "donovon_h@yahoo.com",
    "protopapas.alex@gmail.com",
    "apple.review@seasons.nyc",
    "perla@seasons.nyc",
    "mikecash27@gmail.com",
    "dustin@dustinzuber.com",
    "carlo@cosmicbonds.com",
    "francisco.e.sanchez6@gmail.com",
    "danielrak@me.com",
    "tony@baihu.us",
    "paul@pauloctavious.com",
    "fegw13@gmail.com",
    "gkomran@gmail.com",
    "asturbain1@gmail.com",
  ]
  for (const c of allActiveCustomers) {
    // if (c.user.email !== "waltyp1397+1@gmail.com") {
    //   continue
    // }
    if (ignores.includes(c.user.email)) {
      ignored++
      continue
    }
    console.log(
      `${correct} correct, ${error} wrong, ${ignored} ignored of ${total}`
    )
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
      const suggested = err.extensions.suggestedAddress
      const original = err.extensions.originalAddress

      console.log(`Failure mode: ${err.extensions.failureMode}\n`)
      console.log(`Street1: ${original.street1} --> ${suggested.street1}`)
      if (original.street2 !== suggested.street2) {
        console.log(`Street2: ${original.street2} --> ${suggested.street2}`)
      }
      if (original.city !== suggested.city) {
        console.log(`City: ${original.city} --> ${suggested.city}`)
      }
      if (original.state !== suggested.state) {
        console.log(`State: ${original.state} --> ${suggested.state}`)
      }
      if (!suggested.zip.startsWith(original.zip)) {
        console.log(`Zip: ${original.zip} --> ${suggested.zip}`)
      }
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
      } else {
        ignores.push(c.user.email)
        console.log(ignores)
      }
    }
  }

  console.log("all addressed fixed")
}

seed()
