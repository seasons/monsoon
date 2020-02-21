import { getAllModels } from "../utils"
import { Identity } from "../../utils"
import { getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"

export const syncModels = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Models", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Models",
    allProductionRecords: await getAllModels(getProductionBase()),
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        Products: [],
      }),
    cliProgressBar,
  })
}
export const getNumLinksModels = () => 0
