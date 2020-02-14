import { getAllUsers, getAllLocations } from "../../src/airtable/utils"
import { productionBase, stagingBase } from "./"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
} from "./utils"
import { linkStagingRecords } from "./linkStagingRecords"

export const syncUsers = async () => {
  console.log(" -- Users -- ")

  const allUsersProduction = await getAllUsers(productionBase)
  await deleteAllStagingRecords("Users")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Users",
    allProductionRecords: allUsersProduction,
    sanitizeFunc: fields => {
      const sanitizedFields = {
        ...fields,
        "Shipping Address": [],
        Location: [],
        "Billing Info": [],
        Reservations: [],
      }
      delete sanitizedFields.Joined
      delete sanitizedFields["Full Name"]
      return sanitizedFields
    },
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
