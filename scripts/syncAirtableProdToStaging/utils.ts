import {
  getAllBrands,
  getAllColors,
  getAllModels,
  AirtableModelName,
  getAllCategories,
  getAllLocations,
} from "../../src/airtable/utils"
import { stagingBase, productionBase } from "./"

export const syncBrands = async () => {
  console.log(" -- BRANDS -- ")

  await deleteAllStagingRecords("Brands")
  await createAllStagingRecordsWithoutLinks(
    "Brands",
    await getAllBrands(productionBase),
    fields => {
      return {
        ...fields,
        Logo: [],
        Products: [],
      }
    }
  )
}

export const syncColors = async () => {
  console.log(" -- COLORS -- ")

  await deleteAllStagingRecords("Colors")
  await createAllStagingRecordsWithoutLinks(
    "Colors",
    await getAllColors(productionBase),
    fields => fields
  )
}

export const syncModels = async () => {
  console.log(" -- Models -- ")

  await deleteAllStagingRecords("Models")
  await createAllStagingRecordsWithoutLinks(
    "Models",
    await getAllModels(productionBase),
    fields => {
      return {
        ...fields,
        Products: [],
      }
    }
  )
}

export const syncLocations = async () => {
  console.log(" -- Locations -- ")

  await deleteAllStagingRecords("Locations")
  await createAllStagingRecordsWithoutLinks(
    "Locations",
    await getAllLocations(productionBase),
    fields => {
      const sanitizedFields = {
        ...fields,
        "Physical Products": [],
        Reservations: "",
        "Reservations 2": [],
        "Reservations 3": [],
        Users: [],
        "Users 2": [],
      }
      delete sanitizedFields["Created At"]
      delete sanitizedFields["Updated At"]
      return sanitizedFields
    }
  )
}
export const airtableModelNameToGetAllFunc = (modelname: AirtableModelName) => {
  const func = {
    Colors: getAllColors,
    Brands: getAllBrands,
    Models: getAllModels,
    Categories: getAllCategories,
    Locations: getAllLocations,
  }[modelname]
  if (!func) {
    throw new Error(`Unrecognized model name: ${modelname}`)
  }
  return func
}

export const deleteAllStagingRecords = async (modelName: AirtableModelName) => {
  const allRecords = await airtableModelNameToGetAllFunc(modelName)(stagingBase)
  for (const rec of allRecords) {
    await stagingBase(`${modelName}`).destroy([rec.id])
  }
}

export const createAllStagingRecordsWithoutLinks = async (
  modelName: AirtableModelName,
  allProductionRecords: any[],
  sanitizeFunc: (fields: any) => any
) => {
  for (const rec of allProductionRecords) {
    await stagingBase(`${modelName}`).create([
      { fields: sanitizeFunc(rec.fields) },
    ])
  }
}
