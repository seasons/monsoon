import { deleteFieldsFromObject } from "../../utils"
import {
  getAllPhysicalProducts,
  getAllProducts,
  getAllProductVariants,
  getAllLocations,
  AirtableData,
} from "../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."

export const syncPhysicalProducts = async (cliProgressBar?: any) => {
  const allPhysicalProductsProduction = await getAllPhysicalProducts(
    getProductionBase()
  )
  await deleteAllStagingRecords("Physical Products", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Physical Products",
    allProductionRecords: allPhysicalProductsProduction,
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          Product: [],
          Location: [],
          "Product Variant": [],
          Reservations: [],
        },
        [
          "Created At",
          "Updated At",
          "Sequence Number",
          "Item Weight",
          "Barcode Image URL",
          "Images",
          "Barcode",
        ]
      ),
    cliProgressBar,
  })
  const allPhysicalProductsStaging = await getAllPhysicalProducts(
    getStagingBase()
  )
  await addProductLinks(
    allPhysicalProductsProduction,
    allPhysicalProductsStaging,
    cliProgressBar
  )
  await addProductVariantLinks(
    allPhysicalProductsProduction,
    allPhysicalProductsStaging,
    cliProgressBar
  )
  await addLocationLinks(
    allPhysicalProductsProduction,
    allPhysicalProductsStaging,
    cliProgressBar
  )
}

export const getNumLinksPhysicalProducts = () => 3

const addProductLinks = async (
  allPhysicalProductsProduction: AirtableData,
  allPhysicalProductsStaging: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Physical Products",
    targetFieldNameOnRootRecord: "Product",
    allRootProductionRecords: allPhysicalProductsProduction,
    allRootStagingRecords: allPhysicalProductsStaging,
    allTargetProductionRecords: await getAllProducts(getProductionBase()),
    allTargetStagingRecords: await getAllProducts(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.SUID.text,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}

const addProductVariantLinks = async (
  allPhysicalProductsProduction: AirtableData,
  allPhysicalProductsStaging: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Physical Products",
    targetFieldNameOnRootRecord: "Product Variant",
    allRootProductionRecords: allPhysicalProductsProduction,
    allRootStagingRecords: allPhysicalProductsStaging,
    allTargetProductionRecords: await getAllProductVariants(
      getProductionBase()
    ),
    allTargetStagingRecords: await getAllProductVariants(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.SUID.text,
    getTargetRecordIdentifer: rec => rec.fields.SKU,
    cliProgressBar,
  })
}

const addLocationLinks = async (
  allPhysicalProductsProduction: AirtableData,
  allPhysicalProductsStaging: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Physical Products",
    targetFieldNameOnRootRecord: "Location",
    allRootProductionRecords: allPhysicalProductsProduction,
    allRootStagingRecords: allPhysicalProductsStaging,
    allTargetProductionRecords: await getAllLocations(getProductionBase()),
    allTargetStagingRecords: await getAllLocations(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.SUID.text,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}
