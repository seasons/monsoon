import { base } from "./config"

export type AirtableProductVariantCounts = {
  "Reservable Count": number
  "Reserved Count": number
  "Non-Reservable Count": number
}

export function updateProductVariantCounts(
  airtableID: string,
  counts: AirtableProductVariantCounts
) {
  base("Product Variants").update(airtableID, counts)
}
