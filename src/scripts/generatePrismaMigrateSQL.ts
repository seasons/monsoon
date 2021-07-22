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

const IntLists = [
  { table: "CustomerDetail", val: "waistSizes" },
  { table: "CustomerDetail", val: "weight" },
]

const run = async () => {
  for (const table of Object.keys(SCALAR_LIST_FIELD_NAMES)) {
    for (const val of SCALAR_LIST_FIELD_NAMES[table]) {
      const listType = !!IntLists.find(a => a.table === table && a.val === val)
        ? "integer"
        : "text"
      console.log(
        `ALTER TABLE monsoon$dev."${table}" ADD COLUMN ${val} ${listType}[];\n`
      )

      console.log(`UPDATE monsoon$dev."${table}"
    SET ${val} = t.values
FROM (
    SELECT "nodeId", array_agg(VALUE ORDER BY position) AS values
    FROM monsoon$dev."${table}_${val}"
    GROUP BY "nodeId"
    ) t
WHERE t."nodeId" = monsoon$dev."${table}"."id";\n`)

      console.log(`DROP TABLE monsoon$dev."${table}_${val}";`)
      console.log(`\n`)
    }
  }
}
run()
