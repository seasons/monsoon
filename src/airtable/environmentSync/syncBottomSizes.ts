import { getAllBottomSizes, AirtableData, getAllSizes } from "../utils"
import { Identity } from "../../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecords } from "."


export const syncBottomSizes = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Bottom Sizes", cliProgressBar)
  const allProductionRecords = await getAllBottomSizes(getProductionBase())
  await createAllStagingRecordsWithoutLinks({
    modelName: "Bottom Sizes",
    allProductionRecords: allProductionRecords,
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        "Size": [],
        "Product Variants": [],
        "Manufacturer Sizes": []
      }),
    cliProgressBar,
  })

  addSizeLinks(allProductionRecords, await getAllBottomSizes(getStagingBase()), cliProgressBar)
  addManufacturerSizeLinks(allProductionRecords, await getAllBottomSizes(getStagingBase()), cliProgressBar)
}

export const getNumLinksBottomSizes = () => 2

const addSizeLinks = async (
    allBottomSizesProduction: AirtableData,
    allBottomSizesStaging: AirtableData,
    cliProgressBar?: any
  ) => {
    await linkStagingRecords({
      rootRecordName: "Bottom Sizes",
      targetFieldNameOnRootRecord: "Size",
      allRootProductionRecords: allBottomSizesProduction,
      allRootStagingRecords: allBottomSizesStaging,
      allTargetProductionRecords: await getAllSizes(getProductionBase()),
      allTargetStagingRecords: await getAllSizes(getStagingBase()),
      getRootRecordIdentifer: rec => `${rec.fields.Name}${rec.fields.Waist}${rec.fields.Rise}${rec.fields.Hem}${rec.fields.Inseam}`,
      getTargetRecordIdentifer: rec => `${rec.fields.Name}${rec.fields.Type}`,
      cliProgressBar,
    })
  }

  const addManufacturerSizeLinks = async (
    allBottomSizesProduction: AirtableData,
    allBottomSizesStaging: AirtableData,
    cliProgressBar?: any
  ) => {
    await linkStagingRecords({
      rootRecordName: "Bottom Sizes",
      targetFieldNameOnRootRecord: "Manufacturer Sizes",
      allRootProductionRecords: allBottomSizesProduction,
      allRootStagingRecords: allBottomSizesStaging,
      allTargetProductionRecords: await getAllSizes(getProductionBase()),
      allTargetStagingRecords: await getAllSizes(getStagingBase()),
      getRootRecordIdentifer: rec => `${rec.fields.Name}${rec.fields.Waist}${rec.fields.Rise}${rec.fields.Hem}${rec.fields.Inseam}`,
      getTargetRecordIdentifer: rec => `${rec.fields.Name}${rec.fields.Type}`,
      cliProgressBar,
    })
  }