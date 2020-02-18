import { getAllBrands } from "../utils"
import { Identity } from "../../utils"
import { getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  sanitizeAttachments,
} from "./utils"

export const syncBrands = async (cliProgressBar?: any) => {
  await deleteAllStagingRecords("Brands", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Brands",
    allProductionRecords: await getAllBrands(getProductionBase()),
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        Logo: sanitizeAttachments(fields.Logo),
        Products: [],
      }),
    cliProgressBar,
  })
}
export const getNumLinksBrands = () => 0
