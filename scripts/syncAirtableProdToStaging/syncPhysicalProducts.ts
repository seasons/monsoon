import {
  getAllProductVariants,
  getAllProducts,
  getAllPhysicalProducts,
  getAllLocations,
} from "../../src/airtable/utils"
import { productionBase, stagingBase } from "."
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecords } from "./linkStagingRecords"

export const syncPhysicalProducts = async () => {
  console.log(" -- Physical Products -- ")

  const allPhysicalProductsProduction = await getAllPhysicalProducts(
    productionBase
  )
  await deleteAllStagingRecords("Physical Products")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Physical Products",
    allProductionRecords: allPhysicalProductsProduction,
    sanitizeFunc: fields => {
      const sanitizedFields = {
        ...fields,
        Product: [],
        Location: [],
        "Product Variant": [],
        Reservations: [],
      }
      delete sanitizedFields["Created At"]
      delete sanitizedFields["Updated At"]
      delete sanitizedFields["Sequence Number"]
      delete sanitizedFields["Item Weight"]
      delete sanitizedFields["Barcode Image URL"]
      delete sanitizedFields.Images
      delete sanitizedFields.Barcode
      return sanitizedFields
    },
  })
  const allPhysicalProductsStaging = await getAllPhysicalProducts(stagingBase)
  await addProductLinks(
    allPhysicalProductsProduction,
    allPhysicalProductsStaging
  )
  await addProductVariantLinks(
    allPhysicalProductsProduction,
    allPhysicalProductsStaging
  )
  await addLocationLinks(
    allPhysicalProductsProduction,
    allPhysicalProductsStaging
  )
}

const addProductLinks = async (
  allPhysicalProductsProduction,
  allPhysicalProductsStaging
) => {
  await linkStagingRecords({
    rootRecordName: "Physical Products",
    targetFieldNameOnRootRecord: "Product",
    allRootProductionRecords: allPhysicalProductsProduction,
    allRootStagingRecords: allPhysicalProductsStaging,
    allTargetProductionRecords: await getAllProducts(productionBase),
    allTargetStagingRecords: await getAllProducts(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.SUID.text,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}

const addProductVariantLinks = async (
  allPhysicalProductsProduction,
  allPhysicalProductsStaging
) => {
  await linkStagingRecords({
    rootRecordName: "Physical Products",
    targetFieldNameOnRootRecord: "Product Variant",
    allRootProductionRecords: allPhysicalProductsProduction,
    allRootStagingRecords: allPhysicalProductsStaging,
    allTargetProductionRecords: await getAllProductVariants(productionBase),
    allTargetStagingRecords: await getAllProductVariants(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.SUID.text,
    getTargetRecordIdentifer: rec => rec.fields.SKU,
  })
}

const addLocationLinks = async (
  allPhysicalProductsProduction,
  allPhysicalProductsStaging
) => {
  await linkStagingRecords({
    rootRecordName: "Physical Products",
    targetFieldNameOnRootRecord: "Location",
    allRootProductionRecords: allPhysicalProductsProduction,
    allRootStagingRecords: allPhysicalProductsStaging,
    allTargetProductionRecords: await getAllLocations(productionBase),
    allTargetStagingRecords: await getAllLocations(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.SUID.text,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}
