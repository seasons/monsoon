import { getAllCategories } from "../../src/airtable/utils"
import { productionBase, stagingBase } from "./index"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecord } from "./linkStagingRecord"

export const syncCategories = async () => {
  console.log(" -- Categories -- ")

  const allProductionCategories = await getAllCategories(productionBase)
  await deleteAllStagingRecords("Categories")

  // Create records
  await createAllStagingRecordsWithoutLinks(
    "Categories",
    allProductionCategories,
    fields => {
      return {
        ...fields,
        Image: [],
        Parent: [],
        Products: [],
      }
    }
  )

  // Add links to parent category
  await addParentCategoryLinks(allProductionCategories)
}

const addParentCategoryLinks = async allProductionCategories => {
  const allStagingCategories = await getAllCategories(stagingBase)
  for (const productionCategory of allProductionCategories) {
    if (!productionCategory.fields.Parent) {
      continue
    }
    if (productionCategory.fields.Parent.length === 1) {
      await linkStagingRecord({
        rootProductionRecord: productionCategory,
        rootRecordName: "Categories",
        allRootStagingRecords: allStagingCategories,
        allTargetProductionRecords: allProductionCategories,
        allTargetStagingRecords: allStagingCategories,
        // find record with same name
        matchRootRecords: (rootProdRec, candidateRootStagingRec) =>
          candidateRootStagingRec.fields.Name === rootProdRec.fields.Name,
        matchTargetRecords: (targetProdRecord, candidateTargetStagingRecord) =>
          targetProdRecord.fields.Name ===
          candidateTargetStagingRecord.fields.Name,
        getTargetProductionIds: rootProdRec => rootProdRec.fields.Parent,
        createFieldsData: targetRecIDs => {
          return { Parent: targetRecIDs }
        },
      })
    }
  }
}
