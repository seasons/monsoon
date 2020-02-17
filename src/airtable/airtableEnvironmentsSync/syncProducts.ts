import {
  getAllProducts,
  getAllBrands,
  getAllModels,
  getAllCategories,
  getAllCollections,
} from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { productionBase, stagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  sanitizeAttachments,
  linkStagingRecords,
} from "."

export const syncProducts = async () => {
  console.log(" -- Products -- ")

  const allProductsProduction = await getAllProducts(productionBase)
  await deleteAllStagingRecords("Products")
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
        ["Created Date"]
      ),
  })

  const allProductsStaging = await getAllProducts(stagingBase)
  await addBrandLinks(allProductsProduction, allProductsStaging)
  await addModelLinks(allProductsProduction, allProductsStaging)
  await addCategoryLinks(allProductsProduction, allProductsStaging)
  await addCollectionLinks(allProductsProduction, allProductsStaging)
}

const addBrandLinks = async (allProductionProducts, allStagingProducts) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Brand",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllBrands(productionBase),
    allTargetStagingRecords: await getAllBrands(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Name,
  })
}

const addModelLinks = async (allProductionProducts, allStagingProducts) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Model",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllModels(productionBase),
    allTargetStagingRecords: await getAllModels(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Name,
  })
}

const addCategoryLinks = async (allProductionProducts, allStagingProducts) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Category",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllCategories(productionBase),
    allTargetStagingRecords: await getAllCategories(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}

const addCollectionLinks = async (
  allProductionProducts,
  allStagingProducts
) => {
  await linkStagingRecords({
    rootRecordName: "Products",
    targetFieldNameOnRootRecord: "Collections",
    allRootProductionRecords: allProductionProducts,
    allRootStagingRecords: allStagingProducts,
    allTargetProductionRecords: await getAllCollections(productionBase),
    allTargetStagingRecords: await getAllCollections(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.Slug,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}
