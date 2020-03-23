import {
  getAllReservations,
  getAllLocations,
  getAllPhysicalProducts,
  AirtableData,
} from "../utils"

import { deleteFieldsFromObject } from "../../utils"
import { getProductionBase, getStagingBase } from "../config"
import {
  deleteAllStagingRecords,
  createAllStagingRecordsWithoutLinks,
  linkStagingRecords,
  getLocationRecordIdentifier,
} from "."
import { getPhysicalProductRecordIdentifier } from "./syncPhysicalProducts"

export const syncReservations = async (cliProgressBar?: any) => {
  const allReservationsProduction = await getAllReservations(
    getProductionBase()
  )
  await deleteAllStagingRecords("Reservations", cliProgressBar)
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
    cliProgressBar,
  })

  const allReservationsStaging = await getAllReservations(getStagingBase())
  await addShippingAddressLinks(
    allReservationsProduction,
    allReservationsStaging,
    cliProgressBar
  )
  await addItemsLinks(
    allReservationsProduction,
    allReservationsStaging,
    cliProgressBar
  )
}

export const getNumLinksReservations = () => 2

const addShippingAddressLinks = async (
  allReservationsProduction: AirtableData,
  allReservationsStaging: AirtableData,
  cliProgressBar: any
) => {
  await linkStagingRecords({
    rootRecordName: "Reservations",
    targetFieldNameOnRootRecord: "Shipping Address",
    allRootProductionRecords: allReservationsProduction,
    allRootStagingRecords: allReservationsStaging,
    allTargetProductionRecords: await getAllLocations(getProductionBase()),
    allTargetStagingRecords: await getAllLocations(getStagingBase()),
    getRootRecordIdentifer: getReservationRecordIdentifer,
    getTargetRecordIdentifer: getLocationRecordIdentifier,
    cliProgressBar,
  })
}

const addItemsLinks = async (
  allReservationsProduction: AirtableData,
  allReservationsStaging: AirtableData,
  cliProgressBar?: any
) => {
  await linkStagingRecords({
    rootRecordName: "Reservations",
    targetFieldNameOnRootRecord: "Items",
    allRootProductionRecords: allReservationsProduction,
    allRootStagingRecords: allReservationsStaging,
    allTargetProductionRecords: await getAllPhysicalProducts(
      getProductionBase()
    ),
    allTargetStagingRecords: await getAllPhysicalProducts(getStagingBase()),
    getRootRecordIdentifer: getReservationRecordIdentifer,
    getTargetRecordIdentifer: getPhysicalProductRecordIdentifier,
    cliProgressBar,
  })
}

const getReservationRecordIdentifer = rec => rec.fields.ID