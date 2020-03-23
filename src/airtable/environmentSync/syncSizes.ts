import { getAllSizes } from "../utils"
import { Identity } from "../../utils"
import { getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"


export const syncSizes = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Sizes", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Sizes",
    allProductionRecords: await getAllSizes(getProductionBase()),
    sanitizeFunc: fields =>
      Identity({
        ...fields,
        "Top Sizes": [],  
        "Bottom Sizes": [],
        "Bottom Sizes 2": [],
        "Related Size": [],
        "Products": []
      }),
    cliProgressBar,
  })
}
export const getNumLinksSizes = () => 0
