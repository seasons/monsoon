export interface AirtableData extends Array<any> {
  findByIds: (ids?: any) => any
  findMultipleByIds: (ids?: any) => any[]
  fields: any
}

export type AirtableInventoryStatus =
  | "Reservable"
  | "Non Reservable"
  | "Reserved"

export type AirtableModelName =
  | "Colors"
  | "Brands"
  | "Models"
  | "Categories"
  | "Locations"
  | "Products"
  | "Homepage Product Rails"
  | "Product Variants"
  | "Physical Products"
  | "Users"
  | "Reservations"
  | "Collections"
  | "Collection Groups"
  | "Sizes"
  | "Top Sizes"
  | "Bottom Sizes"

export type AirtableProductVariantCounts = {
  "Reservable Count": number
  "Reserved Count": number
  "Non-Reservable Count": number
}
