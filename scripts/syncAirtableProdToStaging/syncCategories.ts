import { getAllCategories } from "../../src/airtable/utils"
import { productionBase, stagingBase } from "./index"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecords } from "./linkStagingRecords"
import { Identity } from "../../src/utils"

export const syncCategories = async () => {
  console.log(" -- Categories -- ")

  const allProductionCategories = await getAllCategories(productionBase)
  await deleteAllStagingRecords("Categories")

  await createAllStagingRecordsWithoutLinks({
    modelName: "Categories",
    allProductionRecords: allProductionCategories,
    sanitizeFunc: fields =>
      Identity({ ...fields, Image: [], Parent: [], Products: [] }),
  })

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
    getRootRecordIdentifer: rec => rec.fields.Name,
    getTargetRecordIdentifer: rec => rec.fields.Name,
  })
}
