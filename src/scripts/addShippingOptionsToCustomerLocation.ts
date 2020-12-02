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

  let i = 0
  for (const location of locations) {
    // console.log(`loc ${i++} of ${locations.length}`)
    const state = location.state?.trim()
    let abbr
    if (!!state && state?.length > 2) {
      if (state === "Oregon") {
        abbr = "OR"
      } else {
        abbr = states.abbr(state)
      }
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

  let count = 0

  for (const customer of customers) {
    const shippingOptions = customer?.detail?.shippingAddress?.shippingOptions
    count++
    console.log(`updating ${count} of ${customers.length}`)
    if (shippingOptions?.length > 2) {
      const shippingAddress = customer.detail?.shippingAddress
      console.log("fixing ", customer.id)
      if (shippingAddress?.id) {
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

          console.log("shippingOptions to add: ", shippingOptions)

          await ps.client.updateLocation({
            where: { id: shippingAddress.id },
            data: {
              shippingOptions: {
                set: shippingOptions.map(s => ({ id: s.id })),
              },
            },
          })
        }
      }
    }
  }
}

// createShippingMethods()
// updateLocationStatesToAbbr()
updateCustomers()
