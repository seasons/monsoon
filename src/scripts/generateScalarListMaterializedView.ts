import "module-alias/register"

export const SCALAR_LIST_FIELD_NAMES = {
  BlogPost: ["tags"],
  Brand: ["styles"],
  Collection: ["descriptions", "placements"],
  Product: ["outerMaterials", "innerMaterials", "styles"],
  ProductSeason: ["wearableSeasons"],
  ShopifyShop: ["scope"],
  PhysicalProductQualityReport: ["damageTypes"],
  SmsReceipt: ["mediaUrls"],
  User: ["roles"],
  StylePreferences: ["styles", "patterns", "colors", "brands"],
  CustomerDetail: ["weight", "topSizes", "waistSizes", "styles"],
  ProductVariantFeedbackQuestion: ["options", "responses"],
  ProductRequest: ["images"],
}

const run = () => {
  for (const table of Object.keys(SCALAR_LIST_FIELD_NAMES)) {
    const columns = SCALAR_LIST_FIELD_NAMES[table]
    for (const col of columns) {
      console.log(`
SELECT id, unnest("${col}") as ${col}
FROM monsoon$production."${table}"`)
    }
  }
}

run()
