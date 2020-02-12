import { getAllBrands, getAllColors } from "../src/airtable/utils"
import * as Airtable from "airtable"
import { base } from "../src/airtable/config"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const productionBase = Airtable.base("appvmn48T0eEl4lGV")
// const stagingBase = Airtable.base("app9otmmsjksEbOHZ")
const stagingBase = Airtable.base("appWWFMmeY2KCDgN8")

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
    // Sync colors
    // Get all production colors
    const allColorRecords = await getAllColors(productionBase)
    await deleteAllStagingColors()
    for (const colorRecord of allColorRecords) {
      await stagingBase("Colors").create([{ fields: colorRecord.fields }])
    }
  } catch (err) {
    console.log(err)
  }
}

const deleteAllStagingBrands = async () => {
  const allBrands = await getAllBrands(stagingBase)
  for (const brand of allBrands) {
    await base("Brands").destroy([brand.id])
  }
}

const deleteAllStagingColors = async () => {
  const base = stagingBase
  const allColors = await getAllColors(base)
  for (const color of allColors) {
    console.log(`Destroy color ${color.id}`)
    await base("Colors").destroy([color.id])
  }
}

// deleteAllStagingBrands()
sync()
