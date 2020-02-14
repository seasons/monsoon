import * as Airtable from "airtable"
import { syncCategories } from "./syncCategories"
import { syncBrands, syncModels, syncColors, syncLocations } from "./utils"
import { syncProducts } from "./syncProducts"
import { syncHomepageProductRails } from "./syncHomepageProductRails"
import { syncProductVariants } from "./syncProductVariants"
import { syncPhysicalProducts } from "./syncPhysicalProducts"
import { syncUsers } from "./syncUsers"
import { syncReservations } from "./syncReservations"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

export const productionBase = Airtable.base("appvmn48T0eEl4lGV")
// export const stagingBase = Airtable.base("app9otmmsjksEbOHZ")
export const stagingBase = Airtable.base("appJa6pNZkPgDKhuT") // test base

const sync = async () => {
  // Note that the order matters here in order to properly link between tables.
  try {
    await syncColors()
    await syncBrands()
    await syncModels()
    await syncCategories()
    await syncLocations()
    await syncProducts()
    await syncHomepageProductRails()
    await syncProductVariants()
    await syncPhysicalProducts()
    await syncUsers()
    await syncReservations()
  } catch (err) {
    console.log(err)
  }
}

sync()
