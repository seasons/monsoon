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

export const SINGLETON_RELATIONS_POSING_AS_ARRAYS = {
  Product: [
    {
      field: "materialCategory",
      joinTable: "_ProductToProductMaterialCategory",
      model: "ProductMaterialCategory",
    },
    {
      field: "model",
      joinTable: "_ProductToProductModel",
      model: "ProductModel",
    },
  ],
  ProductVariant: [
    {
      field: "product",
      joinTable: "_ProductToProductVariant",
      model: "Product",
    },
  ],
  ProductVariantFeedback: [
    {
      field: "reservationFeedback",
      joinTable: "_ProductVariantFeedbackToReservationFeedback",
      model: "ReservationFeedback",
    },
  ],
  ProductVariantFeedbackQuestion: [
    {
      field: "variantFeedback",
      joinTable: "_ProductVariantFeedbackToProductVariantFeedbackQuestion",
      model: "ProductVariantFeedback",
    },
  ],
  PushNotificationReceipt: [
    {
      field: "userPushNotification",
      joinTable: "_PushNotificationReceiptToUserPushNotification",
      model: "UserPushNotification",
    },
  ],
  ReservationReceiptItem: [
    {
      field: "receipt",
      joinTable: "_ReservationReceiptToReservationReceiptItem",
      model: "ReservationReceipt",
    },
  ],
  ShopifyProductVariantSelectedOption: [
    {
      field: "shopifyProductVariant",
      joinTable: "_ShopifyProductVariantToVariantSelectedOption",
      model: "ShopifyProductVariant",
    },
  ],
  SmsReceipt: [
    { field: "user", joinTable: "_UserToSmsReceipts", model: "User" },
  ],
  UserPushNotificationInterest: [
    {
      field: "userPushNotification",
      joinTable: "_UserPushNotificationToUserPushNotificationInterest",
      model: "UserPushNotification",
    },
  ],
  CustomerNotificationBarReceipt: [
    {
      field: "customer",
      joinTable: "_CustomerToCustomerNotificationBarReceipts",
      model: "Customer",
    },
  ],
  PhysicalProduct: [
    {
      field: "productVariant",
      joinTable: "_PhysicalProductToProductVariant",
      model: "ProductVariant",
    },
  ],
  SyncTiming: [
    {
      field: "customer",
      joinTable: "_CustomerToSyncTiming",
      model: "Customer",
    },
  ],
}

const IntLists = [
  { table: "CustomerDetail", val: "waistSizes" },
  { table: "CustomerDetail", val: "weight" },
]

const generateScalarListMigration = async () => {
  for (const table of Object.keys(SCALAR_LIST_FIELD_NAMES)) {
    for (const val of SCALAR_LIST_FIELD_NAMES[table]) {
      const listType = !!IntLists.find(a => a.table === table && a.val === val)
        ? "integer"
        : "text"
      console.log(
        `ALTER TABLE monsoon$dev."${table}" ADD COLUMN "${val}" ${listType}[];\n`
      )

      console.log(`UPDATE monsoon$dev."${table}"
    SET "${val}" = t.values
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

const generateRelationsMigration = async () => {
  // Migrations for all tables
  for (const table of Object.keys(SINGLETON_RELATIONS_POSING_AS_ARRAYS)) {
    if (table === "ProductVariant") {
      // Specific case for product variant.
      console.log(`
ALTER TABLE monsoon$dev."ProductVariant"
DROP COLUMN "productID";`)
    }
    for (const relation of SINGLETON_RELATIONS_POSING_AS_ARRAYS[table]) {
      const joinTableIsFromRootTableToForeignTable = relation.joinTable
        .replace("_", "")
        .startsWith(table)
      console.log(`
ALTER TABLE monsoon$dev."${table}" ADD COLUMN "${relation.field}" VARCHAR(30);
ALTER TABLE monsoon$dev."${table}" ADD CONSTRAINT fk_${relation.field}
FOREIGN KEY ("${relation.field}")
REFERENCES monsoon$dev."${relation.model}"("id");`)

      console.log(`
UPDATE monsoon$dev."${table}"
SET "${relation.field}" = monsoon$dev."${relation.joinTable}"."${
        joinTableIsFromRootTableToForeignTable ? "B" : "A"
      }"
FROM monsoon$dev."${relation.joinTable}"
WHERE  monsoon$dev."${relation.joinTable}"."${
        joinTableIsFromRootTableToForeignTable ? "A" : "B"
      }" = monsoon$dev."${table}"."id";\n`)

      console.log(`DROP TABLE monsoon$dev."${relation.joinTable}";\n`)
    }
  }
}

// generateScalarListMigration()
generateRelationsMigration()
