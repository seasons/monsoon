export interface AirtableData extends Array<any> {
  findByIds: (ids?: any) => any
  findMultipleByIds: (ids?: any) => any[]
  fields: any
}

export type AirtableInventoryStatus =
  | "Reservable"
  | "Non Reservable"
  | "Reserved"

export type AirtableProductVariantCounts = {
  "Reservable Count": number
  "Reserved Count": number
  "Non-Reservable Count": number
}