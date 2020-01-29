import { base } from "./config"
import { zip } from "lodash"

export function updatePhysicalProduct(
  airtableID: string,
  fields: AirtablePhysicalProductFields
) {
  base("Physical Products").update(airtableID, fields)
}

export function updatePhysicalProducts(
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
  base("Physical Products").update(formattedUpdateData)
}

// ***************************************************
export type AirtableInventoryStatus =
  | "Reservable"
  | "Non Reservable"
  | "Reserved"

// Add to this as needed
export type AirtablePhysicalProductFields = {
  "Inventory Status": AirtableInventoryStatus
}
