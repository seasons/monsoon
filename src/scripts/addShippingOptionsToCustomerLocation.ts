import "module-alias/register"

import fs from "fs"

import { ShippingCode, ShippingOption } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const createShippingMethods = async () => {
  const ps = new PrismaService()

  const methods = ["UPSGround", "UPSSelect"]

  for (const method of methods) {
    const displayText = method === "UPSGround" ? "UPS Ground" : "UPS Select"
    await ps.client.createShippingMethod({
      code: method as ShippingCode,
      displayText,
    })
  }
}

const updateCustomers = async () => {
  const ps = new PrismaService()

  const shippingMethods = await ps.client.shippingMethods()

  const shippingOptionsData = JSON.parse(
    fs.readFileSync(
      process.cwd() + "/src/modules/Shipping/shippingOptionsData.json",
      "utf-8"
    )
  )

  const warehouseLocation = await ps.client.location({
    slug:
      process.env.SEASONS_CLEANER_LOCATION_SLUG || "seasons-cleaners-official",
  })

  const customerData = `{
      id
      status
      detail {
        shippingAddress {
          id
          state
          shippingOptions {
            id
          }
        }
      }
    }`
  const customers = await ps.binding.query.customers({}, customerData)
  const originState = warehouseLocation.state

  for (const customer of customers) {
    const shippingAddress = customer.detail?.shippingAddress
    if (shippingAddress?.id && !shippingAddress?.shippingOptions) {
      const shippingOptions = [] as ShippingOption[]

      const destinationState = shippingAddress.state

      // FIXME: We need to first run the script to ensure all locations are using state abbreviations
      if (destinationState.length > 2 || originState.length > 2) {
        console.log("state length too long", shippingAddress.id)
      } else {
        for (const method of shippingMethods) {
          const stateData =
            shippingOptionsData[method.code].from[originState].to[
              destinationState
            ]

          const shippingOption = await ps.client.createShippingOption({
            origin: { connect: { id: warehouseLocation.id } },
            destination: { connect: { id: shippingAddress.id } },
            shippingMethod: { connect: { id: method.id } },
            externalCost: stateData.price,
            averageDuration: stateData.averageDuration,
          })

          shippingOptions.push(shippingOption)
        }

        await ps.client.updateLocation({
          where: { id: shippingAddress.id },
          data: {
            shippingOptions: {
              connect: shippingOptions.map(s => ({ id: s.id })),
            },
          },
        })
      }
    }
  }
}

// createShippingMethods()
updateCustomers()
