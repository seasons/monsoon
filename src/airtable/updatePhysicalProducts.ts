import { AirtablePhysicalProductFields } from "./updatePhysicalProduct"
import { productionBase } from "./config"
import { zip } from "lodash"

export async function updatePhysicalProducts(
  airtableIDs: [string],
  fields: [AirtablePhysicalProductFields]
) {
  if (airtableIDs.length !== fields.length) {
    throw new Error("airtableIDs and fields must be arrays of equal length")
  }
  if (airtableIDs.length < 1 || airtableIDs.length > 10) {
    throw new Error("please include one to ten airtable record IDs")
  }

  const formattedUpdateData = zip(airtableIDs, fields).map(a => {
    return {
      id: a[0],
      fields: a[1],
    }
  })
  const updatedRecords = await productionBase("Physical Products").update(
    formattedUpdateData
  )
  return updatedRecords
}
