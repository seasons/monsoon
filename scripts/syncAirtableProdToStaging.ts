import { getAllBrands, getAllColors, AirtableData } from "../src/airtable/utils"
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
    syncColorsProdToStaging()
  } catch (err) {
    console.log(err)
  }
}

const syncColorsProdToStaging = async () => {
  const allColorRecords = await getAllColors(productionBase)
  await deleteAllRecordsOnStaging("Colors")
  for (const colorRecord of allColorRecords) {
    await stagingBase("Colors").create([{ fields: colorRecord.fields }])
  }
}

const syncBrandsProdToStaging = async () => {
  const allBrands = await getAllBrands(productionBase)
  await deleteAllRecordsOnStaging("Brands")
  for (const )
}

interface DeleteAllInput {
  getAllFunc: (airtableBase?: any) => Promise<AirtableData>
  modelName: AirtableModeName
}

type AirtableModeName = "Colors" | "Brands"

const deleteAllRecordsOnStaging = async (modelName: AirtableModeName) => {
  const _base = stagingBase
  const allRecords = await airtableModelNameToGetAllFunc(modelName)(_base)
  for (const rec of allRecords) {
    await _base(`${modelName}`).destroy([rec.id])
  }
}

const airtableModelNameToGetAllFunc = (modelname: AirtableModeName) => {
  switch (modelname) {
    case "Colors":
      return getAllColors
    case "Brands":
      return getAllBrands
  }
  throw new Error("invalid model name")
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
