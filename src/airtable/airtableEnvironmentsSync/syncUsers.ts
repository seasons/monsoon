import { getAllUsers, getAllLocations } from "../utils"
import { deleteFieldsFromObject } from "../../utils"
import { productionBase, stagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."

export const syncUsers = async () => {
  console.log(" -- Users -- ")

  const allUsersProduction = await getAllUsers(productionBase)
  await deleteAllStagingRecords("Users")
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
  })
  const allUsersStaging = await getAllUsers(stagingBase)
  await addShippingAddressLinks(allUsersProduction, allUsersStaging)
}

const addShippingAddressLinks = async (allUsersProduction, allUsersStaging) => {
  await linkStagingRecords({
    rootRecordName: "Users",
    targetFieldNameOnRootRecord: "Shipping Address",
    allRootProductionRecords: allUsersProduction,
    allRootStagingRecords: allUsersStaging,
    allTargetProductionRecords: await getAllLocations(productionBase),
    allTargetStagingRecords: await getAllLocations(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.Email,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}
