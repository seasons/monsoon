import {
  getAllBrands,
  getAllColors,
  getAllModels,
  AirtableModelName,
  getAllCategories,
  getAllLocations,
  getAllProducts,
  getAllHomepageProductRails,
  AirtableData,
} from "../../src/airtable/utils"
import { stagingBase, productionBase } from "./"

export const syncBrands = async () => {
  console.log(" -- BRANDS -- ")

  await deleteAllStagingRecords("Brands")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Brands",
    allProductionRecords: await getAllBrands(productionBase),
    sanitizeFunc: fields => {
      return {
        ...fields,
        Logo: sanitizeAttachments(fields.Logo),
        Products: [],
      }
    },
  })
}

export const syncColors = async () => {
  console.log(" -- COLORS -- ")

  await deleteAllStagingRecords("Colors")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Colors",
    allProductionRecords: await getAllColors(productionBase),
    sanitizeFunc: fields => fields,
  })
}

export const syncModels = async () => {
  console.log(" -- Models -- ")

  await deleteAllStagingRecords("Models")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Models",
    allProductionRecords: await getAllModels(productionBase),
    sanitizeFunc: fields => {
      return {
        ...fields,
        Products: [],
      }
    },
  })
}

export const syncLocations = async () => {
  console.log(" -- Locations -- ")

  await deleteAllStagingRecords("Locations")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Locations",
    allProductionRecords: await getAllLocations(productionBase),
    sanitizeFunc: fields => {
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
    },
  })
}

export const airtableModelNameToGetAllFunc = (modelname: AirtableModelName) => {
  const func = {
    Colors: getAllColors,
    Brands: getAllBrands,
    Models: getAllModels,
    Categories: getAllCategories,
    Locations: getAllLocations,
    Products: getAllProducts,
    "Homepage Product Rails": getAllHomepageProductRails,
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

export const createAllStagingRecordsWithoutLinks = async ({
  modelName,
  allProductionRecords,
  sanitizeFunc,
}: {
  modelName: AirtableModelName
  allProductionRecords: AirtableData
  sanitizeFunc: (fields: any) => any
}) => {
  for (const rec of allProductionRecords) {
    console.log(rec.fields.Images)
    // console.log(sanitizeFunc(rec.fields))
    await stagingBase(`${modelName}`).create([
      { fields: sanitizeFunc(rec.fields) },
    ])
  }
}

export const sanitizeAttachments = attachments => {
  return attachments.map(a => {
    return { url: a.url }
  })
}
