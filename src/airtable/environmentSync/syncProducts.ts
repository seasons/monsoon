import {
  getAllProducts,
  getAllBrands,
  getAllModels,
  getAllCategories,
  getAllCollections,
  AirtableData,
} from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  sanitizeAttachments,
  linkStagingRecords,
} from "."

export const syncProducts = async (cliProgressBar?: any) => {
  const allProductsProduction = await getAllProducts(getProductionBase())
  await deleteAllStagingRecords("Products", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Products",
    allProductionRecords: allProductsProduction,
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          Brand: [],
          Model: [],
          "Product Variants": [],
          "Physical Products": [],
          Category: [],
          Images: sanitizeAttachments(fields.Images),
          "Homepage product rail": [],
          Collections: [],
        },
        ["Created Date", "Parent", "Model Height"]
      ),
    cliProgressBar,
  })

  const allProductsStaging = await getAllProducts(getStagingBase())
  await addBrandLinks(allProductsProduction, allProductsStaging, cliProgressBar)
  await addModelLinks(allProductsProduction, allProductsStaging, cliProgressBar)
  await addCategoryLinks(
    allProductsProduction,
    allProductsStaging,
    cliProgressBar
  )
  await addCollectionLinks(
    allProductsProduction,
    allProductsStaging,
    cliProgressBar
  )
}

export const getNumLinksProducts = () => 4

const addBrandLinks = async (
  allProductionProducts: AirtableData,
  allStagingProducts: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Brand",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllBrands(getProductionBase()),
    allTargetStagingRecords: await getAllBrands(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Name,
    cliProgressBar,
  })
}

const addModelLinks = async (
  allProductionProducts: AirtableData,
  allStagingProducts: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Model",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllModels(getProductionBase()),
    allTargetStagingRecords: await getAllModels(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Name,
    cliProgressBar,
  })
}

const addCategoryLinks = async (
  allProductionProducts: AirtableData,
  allStagingProducts: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Category",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllCategories(getProductionBase()),
    allTargetStagingRecords: await getAllCategories(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}

const addCollectionLinks = async (
  allProductionProducts: AirtableData,
  allStagingProducts: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Collections",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllCollections(getProductionBase()),
    allTargetStagingRecords: await getAllCollections(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}
