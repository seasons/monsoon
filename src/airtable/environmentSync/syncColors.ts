import { getAllColors } from "../utils"
import { getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"

export const syncColors = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Colors", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Colors",
    allProductionRecords: await getAllColors(getProductionBase()),
    sanitizeFunc: fields => fields,
    cliProgressBar,
  })
}
export const getNumLinksColors = () => 0
