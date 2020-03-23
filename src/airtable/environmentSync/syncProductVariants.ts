import { getAllProductVariants, getAllProducts, AirtableData, getAllTopSizes, getAllBottomSizes } from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { getStagingBase, getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."
import { getTopSizeRecordIdentifier } from "./syncTopSizes"
import { getBottomSizeRecordIdentifer } from "./syncBottomSizes"

export const syncProductVariants = async (cliProgressBar?) => {
  const allProductVariantsProduction = await getAllProductVariants(
    getProductionBase()
  )
  await deleteAllStagingRecords("Product Variants", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Product Variants",
    allProductionRecords: allProductVariantsProduction,
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          Product: [],
          "Physical Products": [],
          Orders: [],
          "Top Size": [],
          "Bottom Size": []
        },
        ["Variant Number", "Created At", "Images", "Brand", "Color", "Type"]
      ),
    cliProgressBar,
  })
  const allProductVariantsStaging = await getAllProductVariants(
    getStagingBase()
  )
  await addProductLinks(
    allProductVariantsProduction,
    allProductVariantsStaging,
    cliProgressBar
  )
  await addTopSizeLinks(
    allProductVariantsProduction,
    allProductVariantsStaging,
    cliProgressBar
  )
  await addBottomSizeLinks(
    allProductVariantsProduction,
    allProductVariantsStaging,
    cliProgressBar
  )
}

export const getNumLinksProductVariants = () => 3

const addProductLinks = async (
  allProductionProductVariants: AirtableData,
  allStagingProductVariants: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Product Variants",
    targetFieldNameOnRootRecord: "Product",
    allRootProductionRecords: allProductionProductVariants,
    allRootStagingRecords: allStagingProductVariants,
    allTargetProductionRecords: await getAllProducts(getProductionBase()),
    allTargetStagingRecords: await getAllProducts(getStagingBase()),
    getRootRecordIdentifer: getProductVariantRecordIdentifier,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}

const addTopSizeLinks = async (
  allProductionProductVariants: AirtableData,
  allStagingProductVariants: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Product Variants",
    targetFieldNameOnRootRecord: "Top Size",
    allRootProductionRecords: allProductionProductVariants,
    allRootStagingRecords: allStagingProductVariants,
    allTargetProductionRecords: await getAllTopSizes(getProductionBase()),
    allTargetStagingRecords: await getAllTopSizes(getStagingBase()),
    getRootRecordIdentifer: getProductVariantRecordIdentifier,
    getTargetRecordIdentifer: getTopSizeRecordIdentifier,
    cliProgressBar,
  })
}

const addBottomSizeLinks = async (
  allProductionProductVariants: AirtableData,
  allStagingProductVariants: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Product Variants",
    targetFieldNameOnRootRecord: "Bottom Size",
    allRootProductionRecords: allProductionProductVariants,
    allRootStagingRecords: allStagingProductVariants,
    allTargetProductionRecords: await getAllBottomSizes(getProductionBase()),
    allTargetStagingRecords: await getAllBottomSizes(getStagingBase()),
    getRootRecordIdentifer: getProductVariantRecordIdentifier,
    getTargetRecordIdentifer: getBottomSizeRecordIdentifer,
    cliProgressBar,
  })
}

const getProductVariantRecordIdentifier = rec => rec.fields.SKU