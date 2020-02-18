import { getAllProductVariants, getAllProducts, AirtableData } from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { getStagingBase, getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."

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
        },
        ["Variant Number", "Created At", "Images", "Brand", "Color"]
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
}

export const getNumLinksProductVariants = () => 1

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
    getRootRecordIdentifer: rec => rec.fields.SKU,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}
