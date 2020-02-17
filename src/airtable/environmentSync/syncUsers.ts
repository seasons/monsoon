import {
  getAllUsers,
  getAllLocations,
  AirtableData,
  AirtableData,
} from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."

export const syncUsers = async (cliProgressBar?: any) => {
  const allUsersProduction = await getAllUsers(getProductionBase())
  await deleteAllStagingRecords("Users", cliProgressBar)
  await createAllStagingRecordsWithoutLinks({
    modelName: "Users",
    allProductionRecords: allUsersProduction,
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          "Shipping Address": [],
          Location: [],
          "Billing Info": [],
          Reservations: [],
        },
        ["Joined", "Full Name"]
      ),
    cliProgressBar,
  })
  const allUsersStaging = await getAllUsers(getStagingBase())
  await addShippingAddressLinks(
    allUsersProduction,
    allUsersStaging,
    cliProgressBar
  )
}

export const getNumLinksUsers = () => 1

const addShippingAddressLinks = async (
  allUsersProduction: AirtableData,
  allUsersStaging: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Users",
    targetFieldNameOnRootRecord: "Shipping Address",
    allRootProductionRecords: allUsersProduction,
    allRootStagingRecords: allUsersStaging,
    allTargetProductionRecords: await getAllLocations(getProductionBase()),
    allTargetStagingRecords: await getAllLocations(getStagingBase()),
    getRootRecordIdentifer: rec => rec.fields.Email,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
    cliProgressBar,
  })
}
