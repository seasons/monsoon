import "module-alias/register"

import fs from "fs"

import states from "us-state-converter"

import { ShippingCode, ShippingOption } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const createShippingMethods = async () => {
  const ps = new PrismaService()

  const methods = ["UPSGround", "UPSSelect"]

  for (const method of methods) {
    const displayText =
      method === "UPSGround" ? "UPS Ground" : "3-day UPS Select"
    await ps.client.createShippingMethod({
      code: method as ShippingCode,
      displayText,
    })
  }
}

const updateLocationStatesToAbbr = async () => {
  const ps = new PrismaService()
  const locations = await ps.client.locations()

  for (const location of locations) {
    const state = location.state
    let abbr
    if (!!state && state?.length > 2) {
      abbr = states.abbr(state)
      if (abbr && abbr.length === 2) {
        console.log("Updating", abbr)
        await ps.client.updateLocation({
          where: { id: location.id },
          data: {
            state: abbr,
          },
        })
      } else {
        console.log("Error updating location", location.id)
        console.log("Error updating location", state)
      }
    } else if (!state) {
      console.log("error with data", location.id)
    }
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
    if (shippingAddress?.id && shippingAddress?.shippingOptions?.length === 0) {
      const shippingOptions = [] as ShippingOption[]

      let destinationState = shippingAddress.state

      if (destinationState?.length > 2) {
        // Resets location state to abbreviated
        const abbr = states.abbr(destinationState)
        destinationState = abbr
      }

      if (
        !destinationState ||
        !originState ||
        destinationState?.length > 2 ||
        originState?.length > 2
      ) {
        console.log("incomplete data", customer.id)
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
            state: destinationState,
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
// updateCustomers()
updateLocationStatesToAbbr()
