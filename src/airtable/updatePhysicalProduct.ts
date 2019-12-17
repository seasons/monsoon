import { base } from "./config"

export function updatePhysicalProduct(
  airtableID: string,
  fields: AirtablePhysicalProductFields
) {
  base("Physical Products").update(airtableID, fields)
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
