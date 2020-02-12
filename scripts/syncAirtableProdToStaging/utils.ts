import {
  getAllBrands,
  getAllColors,
  getAllModels,
  AirtableModeName,
  getAllCategories,
} from "../../src/airtable/utils"
import { stagingBase, productionBase } from "./"

export const syncBrands = async () => {
  console.log(" -- BRANDS -- ")

  const allBrands = await getAllBrands(productionBase)
  await deleteAllStagingRecords("Brands")
  for (const brand of allBrands) {
    await stagingBase("Brands").create([
      {
        fields: {
          ...brand.fields,
          // (?TODO) If needed, can add code to sync logo
          Logo: [],
          // Will link brands to product records in later function call
          Products: [],
        },
      },
    ])
  }
}

export const syncColors = async () => {
  console.log(" -- COLORS -- ")

  const allColorRecords = await getAllColors(productionBase)
  await deleteAllStagingRecords("Colors")
  for (const colorRecord of allColorRecords) {
    await stagingBase("Colors").create([{ fields: colorRecord.fields }])
  }
}

export const syncModels = async () => {
  console.log(" -- Models -- ")

  const allModels = await getAllModels(productionBase)
  await deleteAllStagingRecords("Models")
  for (const model of allModels) {
    await stagingBase("Models").create([
      {
        fields: {
          ...model.fields,
          // Will link in later function call
          Products: [],
        },
      },
    ])
  }
}

export const airtableModelNameToGetAllFunc = (modelname: AirtableModeName) => {
  const func = {
    Colors: getAllColors,
    Brands: getAllBrands,
    Models: getAllModels,
    Categories: getAllCategories,
  }[modelname]
  if (!func) {
    throw new Error(`Unrecognized model name: ${modelname}`)
  }
  return func
}

export const deleteAllStagingRecords = async (modelName: AirtableModeName) => {
  const _base = stagingBase
  const allRecords = await airtableModelNameToGetAllFunc(modelName)(_base)
  for (const rec of allRecords) {
    await _base(`${modelName}`).destroy([rec.id])
  }
}
