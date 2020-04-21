import { ProductVariant } from "@prisma/index"

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

export type PrismaProductVariantCounts = Pick<
  ProductVariant,
  "reserved" | "nonReservable" | "reservable"
>
export type AirtableProductVariantCounts = {
  "Reservable Count": number
  "Reserved Count": number
  "Non-Reservable Count": number
}

export type AirtableReservationFields = {
  Status:
    | "New"
    | "In Queue"
    | "On Hold"
    | "Packed"
    | "Shipped"
    | "In Transit"
    | "Received"
    | "Cancelled"
    | "Completed"
}

export interface TopSizeFields extends CategorySizeFields {}

export interface BottomSizeFields extends CategorySizeFields {}

type CategorySizeFields = {
  Name: string
}
