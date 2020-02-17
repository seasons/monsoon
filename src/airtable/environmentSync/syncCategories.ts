import { getAllCategories } from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."
import { getProductionBase, getStagingBase } from "../config"

export const syncCategories = async (cliProgressBar?) => {
  const allProductionCategories = await getAllCategories(getProductionBase())
  await deleteAllStagingRecords("Categories", cliProgressBar)

  await createAllStagingRecordsWithoutLinks({
    modelName: "Categories",
    allProductionRecords: allProductionCategories,
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          Image: [],
          Parent: [],
          Products: [],
        },
        ["Products 2"]
      ),
    cliProgressBar,
  })

  const allStagingCategories = await getAllCategories(getStagingBase())
  await addParentCategoryLinks(
    allProductionCategories,
    allStagingCategories,
    cliProgressBar
  )
}

export const getNumLinksCategories = () => 1

const addParentCategoryLinks = async (
  allProductionCategories,
  allStagingCategories,
  cliProgressBar?
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
    cliProgressBar,
  })
}
