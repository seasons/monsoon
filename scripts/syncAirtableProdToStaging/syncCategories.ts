import { getAllCategories } from "../../src/airtable/utils"
import { productionBase, stagingBase } from "./index"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecord } from "./linkStagingRecord"
import { linkStagingRecords } from "./linkStagingRecords"

export const syncCategories = async () => {
  console.log(" -- Categories -- ")

  const allProductionCategories = await getAllCategories(productionBase)
  await deleteAllStagingRecords("Categories")

  // Create records
  await createAllStagingRecordsWithoutLinks({
    modelName: "Categories",
    allProductionRecords: allProductionCategories,
    sanitizeFunc: fields => {
      return {
        ...fields,
        Image: [],
        Parent: [],
        Products: [],
      }
    },
  })

  // Add links to parent category
  const allStagingCategories = await getAllCategories(stagingBase)
  await addParentCategoryLinks(allProductionCategories, allStagingCategories)
}

const addParentCategoryLinks = async (
  allProductionCategories,
  allStagingCategories
) => {
  await linkStagingRecords({
    rootRecordName: "Categories",
    targetFieldNameOnRootRecord: "Parent",
    allRootProductionRecords: allProductionCategories,
    allRootStagingRecords: allStagingCategories,
    allTargetProductionRecords: allProductionCategories,
    allTargetStagingRecords: allStagingCategories,
    // find record with same name
    getRootRecordIdentifer: rec => rec.fields.Name,
    getTargetRecordIdentifer: rec => rec.fields.Name,
  })
}
