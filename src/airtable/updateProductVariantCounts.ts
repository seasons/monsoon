import { base } from "./config"

export type AirtableProductVariantCounts = {
  "Reservable Count": number
  "Reserved Count": number
  "Non-Reservable Count": number
}

export async function updateProductVariantCounts(
  airtableID: string,
  counts: AirtableProductVariantCounts
) {
  return base("Product Variants").update(airtableID, counts)
}
