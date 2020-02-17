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
  getAllProductVariants,
  getAllPhysicalProducts,
  getAllUsers,
  getAllReservations,
} from "../utils"
import { Identity, deleteFieldsFromObject } from "../../utils"
import { getStagingBase, getProductionBase } from "../config"
import { getNumLinks } from "./getNumLinks"

export const syncBrands = async (cliProgressBar?: any) => {
  await deleteAllStagingRecords("Brands", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Brands",
    allProductionRecords: await getAllBrands(getProductionBase()),
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        Logo: sanitizeAttachments(fields.Logo),
        Products: [],
      }),
    cliProgressBar,
  })
}

export const getNumLinksBrands = () => 0

export const syncColors = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Colors", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Colors",
    allProductionRecords: await getAllColors(getProductionBase()),
    sanitizeFunc: fields => fields,
    cliProgressBar,
  })
}
export const getNumLinksColors = () => 0

export const syncModels = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Models", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Models",
    allProductionRecords: await getAllModels(getProductionBase()),
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        Products: [],
      }),
    cliProgressBar,
  })
}
export const getNumLinksModels = () => 0

export const syncLocations = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Locations", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Locations",
    allProductionRecords: await getAllLocations(getProductionBase()),
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          "Physical Products": [],
          Reservations: "",
          "Reservations 2": [],
          "Reservations 3": [],
          Users: [],
          "Users 2": [],
        },
        ["Created At", "Updated At", "Record ID"]
      ),
    cliProgressBar,
  })
}
export const getNumLinksLocations = () => 0

const airtableModelNameToGetAllFunc = (modelname: AirtableModelName) => {
  const func = {
    Colors: getAllColors,
    Brands: getAllBrands,
    Models: getAllModels,
    Categories: getAllCategories,
    Locations: getAllLocations,
    Products: getAllProducts,
    "Homepage Product Rails": getAllHomepageProductRails,
    "Product Variants": getAllProductVariants,
    "Physical Products": getAllPhysicalProducts,
    Users: getAllUsers,
    Reservations: getAllReservations,
  }[modelname]
  if (!func) {
    throw new Error(`Unrecognized model name: ${modelname}`)
  }
  return func
}

export const getNumProdAndStagingRecords = async (
  modelName: AirtableModelName
) => {
  const prodRecords = await airtableModelNameToGetAllFunc(modelName)(
    getProductionBase()
  )
  const stagingRecords = await airtableModelNameToGetAllFunc(modelName)(
    getStagingBase()
  )
  return [prodRecords.length, stagingRecords.length]
}

export const getNumReadWritesToSyncModel = async (
  modelName: AirtableModelName
) => {
  const [numProdRecs, numStagingRecs] = await getNumProdAndStagingRecords(
    modelName
  )
  return (1 + getNumLinks(modelName)) * numProdRecs + numStagingRecs
}

export const deleteAllStagingRecords = async (
  modelName: AirtableModelName,
  cliProgressBar?: any
) => {
  const allRecords = await airtableModelNameToGetAllFunc(modelName)(
    getStagingBase()
  )
  for (const rec of allRecords) {
    cliProgressBar?.increment()
    await getStagingBase()(`${modelName}`).destroy([rec.id])
  }
}

export const createAllStagingRecordsWithoutLinks = async ({
  modelName,
  allProductionRecords,
  sanitizeFunc,
  cliProgressBar,
}: {
  modelName: AirtableModelName
  allProductionRecords: AirtableData
  sanitizeFunc: (fields: any) => any
  cliProgressBar?: any
}) => {
  for (const rec of allProductionRecords) {
    cliProgressBar?.increment()
    // console.log(sanitizeFunc(rec.fields))
    await getStagingBase()(`${modelName}`).create([
      { fields: sanitizeFunc(rec.fields) },
    ])
  }
}

export const sanitizeAttachments = attachments =>
  attachments?.map(a => Identity({ url: a.url }))
