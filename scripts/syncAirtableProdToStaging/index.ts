import * as Airtable from "airtable"
import { syncCategories } from "./syncCategories"
import { syncBrands, syncModels, syncColors, syncLocations } from "./utils"
import { syncProducts } from "./syncProducts"
import { syncHomepageProductRails } from "./syncHomepageProductRails"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

export const productionBase = Airtable.base("appvmn48T0eEl4lGV")
// export const stagingBase = Airtable.base("app9otmmsjksEbOHZ")
export const stagingBase = Airtable.base("appJa6pNZkPgDKhuT") // test base

export const sync = async () => {
  //   await syncBrands()
  //   await syncCategories()
  //   await syncColors()
  //   await syncLocations()
  //   await syncProducts()
  //   await syncProductVariants()
  //   await syncPhysicalProducts()
  //   await syncCollections()
  //   await syncCollectionGroups()
  //   await syncHomepageProductRails()

  try {
    // await syncColors()
    // await syncBrands()
    // await syncModels()
    // await syncCategories()
    // await syncLocations()
    // await syncCollections()
    await syncProducts()
    // await syncHomepageProductRails()
  } catch (err) {
    console.log(err)
  }
}

sync()
