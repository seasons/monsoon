import { getAllTopSizes, AirtableData, getAllSizes } from "../utils"
import { Identity } from "../../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecords } from "."


export const syncTopSizes = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Top Sizes", cliProgressBar)
  const allProductionRecords = await getAllTopSizes(getProductionBase())
  await createAllStagingRecordsWithoutLinks({
    modelName: "Top Sizes",
    allProductionRecords: allProductionRecords,
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        "Size": [],
        "Product Variants": []
      }),
    cliProgressBar,
  })

  addSizeLinks(allProductionRecords, await getAllTopSizes(getStagingBase()), cliProgressBar)
}

export const getNumLinksTopSizes = () => 1

const addSizeLinks = async (
    allTopSizesProduction: AirtableData,
    allTopSizesStaging: AirtableData,
    cliProgressBar?: any
  ) => {
    await linkStagingRecords({
      rootRecordName: "Top Sizes",
      targetFieldNameOnRootRecord: "Size",
      allRootProductionRecords: allTopSizesProduction,
      allRootStagingRecords: allTopSizesStaging,
      allTargetProductionRecords: await getAllSizes(getProductionBase()),
      allTargetStagingRecords: await getAllSizes(getStagingBase()),
      getRootRecordIdentifer: rec => `${rec.fields.Name}${rec.fields.Length}${rec.fields.Sleeve}${rec.fields.Shoulder}${rec.fields.Chest}${rec.fields.Neck}`,
      getTargetRecordIdentifer: rec => `${rec.fields.Name}${rec.fields.Type}`,
      cliProgressBar,
    })
  }