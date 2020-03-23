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
  getProductRecordIdentifer,
  getProductVariantRecordIdentifier,
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
          "Category",
          "Type"
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
}

export const getNumLinksPhysicalProducts = () => 2

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
    getRootRecordIdentifer: getPhysicalProductRecordIdentifier,
    getTargetRecordIdentifer: getProductRecordIdentifer,
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
    getRootRecordIdentifer: getPhysicalProductRecordIdentifier,
    getTargetRecordIdentifer: getProductVariantRecordIdentifier,
    cliProgressBar,
  })
}

export const getPhysicalProductRecordIdentifier = rec => rec.fields.SUID.text