import { getAllCategories } from "../utils"
import { Identity } from "../../utils"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."
import { productionBase, stagingBase } from "../config"

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
