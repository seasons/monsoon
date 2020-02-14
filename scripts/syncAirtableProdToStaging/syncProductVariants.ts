import { getAllProductVariants, getAllProducts } from "../../src/airtable/utils"
import { productionBase, stagingBase } from "."
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecords } from "./linkStagingRecords"

export const syncProductVariants = async () => {
  console.log(" -- Product Variants -- ")

  const allProductVariantsProduction = await getAllProductVariants(
    productionBase
  )
  await deleteAllStagingRecords("Product Variants")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Product Variants",
    allProductionRecords: allProductVariantsProduction,
    sanitizeFunc: fields => {
      const sanitizedFields = {
        ...fields,
        Product: [],
        "Physical Products": [],
        Orders: [],
      }
      delete sanitizedFields["Variant Number"]
      delete sanitizedFields["Created At"]
      delete sanitizedFields.Images
      delete sanitizedFields.Brand
      delete sanitizedFields.Color
      return sanitizedFields
    },
  })
  const allProductVariantsStaging = await getAllProductVariants(stagingBase)
  await addProductLinks(allProductVariantsProduction, allProductVariantsStaging)
}

const addProductLinks = async (
  allProductionProductVariants,
  allStagingProductVariants
) => {
  await linkStagingRecords({
    rootRecordName: "Product Variants",
    targetFieldNameOnRootRecord: "Product",
    allRootProductionRecords: allProductionProductVariants,
    allRootStagingRecords: allStagingProductVariants,
    allTargetProductionRecords: await getAllProducts(productionBase),
    allTargetStagingRecords: await getAllProducts(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.SKU,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}
