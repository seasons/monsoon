import { getAllLocations } from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { getProductionBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"

export const syncLocations = async (cliProgressBar?) => {
  await deleteAllStagingRecords("Locations", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Locations",
    allProductionRecords: await getAllLocations(getProductionBase()),
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          "Physical Products": [],
          Reservations: "",
          "Reservations 2": [],
          "Reservations 3": [],
          Users: [],
          "Users 2": [],
        },
        ["Created At", "Updated At", "Record ID"]
      ),
    cliProgressBar,
  })
}
export const getNumLinksLocations = () => 0
