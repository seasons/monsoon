import {
  BillingInfoCreateInput,
  CustomerDetailCreateInput,
  CustomerStatus,
  ProductVariant,
} from "@prisma/index"

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
    | "Queued"
    | "Packed"
    | "Shipped"
    | "Delivered"
    | "Completed"
    | "Cancelled"
    | "Blocked"
    | "Unknown"
    | "In Transit"
    | "Received"
}

export interface AirtableUserFields extends CustomerDetailCreateInput {
  plan?: string
  status?: CustomerStatus
  billingInfo?: BillingInfoCreateInput
}

export type AirtablePhysicalProductFields = {
  "Inventory Status": AirtableInventoryStatus
}

export interface TopSizeFields extends CategorySizeFields {}

export interface BottomSizeFields extends CategorySizeFields {}

type CategorySizeFields = {
  Name: string
}
