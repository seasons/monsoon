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
  getAllSizes,
  getAllTopSizes,
  getAllBottomSizes,
} from "../utils"
import { Identity } from "../../utils"
import { getStagingBase, getProductionBase } from "../config"
import { getNumLinks } from "./getNumLinks"

export const airtableModelNameToGetAllFunc = (modelname: AirtableModelName) => {
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
    Sizes: getAllSizes,
    "Top Sizes": getAllTopSizes,
    "Bottom Sizes": getAllBottomSizes
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
