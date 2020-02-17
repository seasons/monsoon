import {
  getAllReservations,
  getAllLocations,
  getAllPhysicalProducts,
} from "../utils"

import { deleteFieldsFromObject } from "../../utils"
import { productionBase, stagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
} from "."

export const syncReservations = async () => {
  console.log(" -- Reservations -- ")

  const allReservationsProduction = await getAllReservations(productionBase)
  await deleteAllStagingRecords("Reservations")
  await createAllStagingRecordsWithoutLinks({
    modelName: "Reservations",
    allProductionRecords: allReservationsProduction,
    sanitizeFunc: fields =>
      deleteFieldsFromObject(
        {
          ...fields,
          User: [],
          "Current Location": [],
          "Shipping Address": [],
          Items: [],
        },
        [
          "Return Date",
          "Created At",
          "Updated At",
          "Reservation Count",
          "Country",
          "Order Weight Unit",
          "User Location",
          "User Email",
          "Images",
          "Recipient Name",
          "Email",
          "Phone",
          "Street Line 1",
          "Street Line 2",
          "City",
          "State/Province",
          "Zip/Postal Code",
          "Order Weight",
        ]
      ),
  })

  const allReservationsStaging = await getAllReservations(stagingBase)
  await addCurrentLocationLinks(
    allReservationsProduction,
    allReservationsStaging
  )
  await addShippingAddressLinks(
    allReservationsProduction,
    allReservationsStaging
  )
  await addItemsLinks(allReservationsProduction, allReservationsStaging)
}

const addCurrentLocationLinks = async (
  allReservationsProduction,
  allReservationsStaging
) => {
  await linkStagingRecords({
    rootRecordName: "Reservations",
    targetFieldNameOnRootRecord: "Current Location",
    allRootProductionRecords: allReservationsProduction,
    allRootStagingRecords: allReservationsStaging,
    allTargetProductionRecords: await getAllLocations(productionBase),
    allTargetStagingRecords: await getAllLocations(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.ID,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}

const addShippingAddressLinks = async (
  allReservationsProduction,
  allReservationsStaging
) => {
  await linkStagingRecords({
    rootRecordName: "Reservations",
    targetFieldNameOnRootRecord: "Shipping Address",
    allRootProductionRecords: allReservationsProduction,
    allRootStagingRecords: allReservationsStaging,
    allTargetProductionRecords: await getAllLocations(productionBase),
    allTargetStagingRecords: await getAllLocations(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.ID,
    getTargetRecordIdentifer: rec => rec.fields.Slug,
  })
}

const addItemsLinks = async (
  allReservationsProduction,
  allReservationsStaging
) => {
  await linkStagingRecords({
    rootRecordName: "Reservations",
    targetFieldNameOnRootRecord: "Items",
    allRootProductionRecords: allReservationsProduction,
    allRootStagingRecords: allReservationsStaging,
    allTargetProductionRecords: await getAllPhysicalProducts(productionBase),
    allTargetStagingRecords: await getAllPhysicalProducts(stagingBase),
    getRootRecordIdentifer: rec => rec.fields.ID,
    getTargetRecordIdentifer: rec => rec.fields.SUID.text,
  })
}
