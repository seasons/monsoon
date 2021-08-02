import "module-alias/register"

import fs from "fs"

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

const ENUMS = {
  ProductTierName: {
    values: ["Standard", "Luxury"],
    usage: [{ table: "ProductTier", column: "tier" }],
  },
  BrandTier: {
    values: [
      "Tier0",
      "Tier1",
      "Tier2",
      "Niche",
      "Upcoming",
      "Retro",
      "Boutique",
      "Local",
      "Discovery",
    ],
    usage: [{ table: "Brand", column: "tier" }],
  },
  Department: {
    values: ["Clothes", "Bags", "Accessories", "Jewelry"],
    usage: [],
  },
  LocationType: {
    values: ["Office", "Warehouse", "Cleaner", "Customer"],
    usage: [{ table: "Location", column: "locationType" }],
  },
  MeasurementType: {
    values: ["Inches", "Millimeters"],
    usage: [{ table: "Category", column: "measurementType" }],
  },
  CustomerStatus: {
    values: [
      "Invited",
      "Created",
      "Waitlisted",
      "Authorized",
      "Active",
      "Suspended",
      "PaymentFailed",
      "Paused",
      "Deactivated",
    ],
    usage: [{ table: "Customer", column: "status" }],
  },
  UserRole: {
    values: ["Admin", "Customer", "Partner", "Marketer"],
    usage: [
      { table: "User", column: "role" },
      { table: "User", column: "roles", isArray: true },
    ],
  },
  InventoryStatus: {
    values: ["NonReservable", "Reservable", "Reserved", "Stored", "Offloaded"],
    usage: [{ table: "PhysicalProduct", column: "inventoryStatus" }],
  },
  PhysicalProductStatus: {
    values: [
      "New",
      "Used",
      "Dirty",
      "Damaged",
      "PermanentlyDamaged",
      "Clean",
      "Lost",
      "Sold",
    ],
    usage: [
      { table: "PhysicalProduct", column: "productStatus" },
      { table: "ReservationReceiptItem", column: "productStatus" },
    ],
  },
  PhysicalProductOffloadMethod: {
    values: [
      "SoldToUser",
      "SoldToThirdParty",
      "ReturnedToVendor",
      "Recycled",
      "Unknown",
    ],
    usage: [{ table: "PhysicalProduct", column: "offloadMethod" }],
  },
  ProductStatus: {
    values: ["Available", "NotAvailable", "Stored", "Offloaded"],
    usage: [{ table: "Product", column: "status" }],
  },
  PackageStatus: {
    values: [
      "Queued",
      "Shipped",
      "Delivered",
      "Blocked",
      "Received",
      "Cancelled",
    ],
    usage: [{ table: "Package", column: "status" }],
  },
  ReservationStatus: {
    values: [
      "Queued",
      "Picked",
      "Packed",
      "Shipped",
      "Delivered",
      "Completed",
      "Cancelled",
      "Hold",
      "Blocked",
      "Unknown",
      "Lost",
      "Received",
    ],
    usage: [{ table: "Reservation", column: "status" }],
  },
  BagItemStatus: {
    values: ["Added", "Reserved", "Received"],
    usage: [{ table: "BagItem", column: "status" }],
  },
  Plan: {
    values: ["AllAccess", "Essential"],
    usage: [{ table: "Customer", column: "plan" }],
  },
  ProductType: {
    values: ["Top", "Bottom", "Accessory", "Shoe"],
    usage: [
      { table: "Category", column: "productType" },
      { table: "Product", column: "type" },
      { table: "Size", column: "productType" },
    ],
  },
  BottomSizeType: {
    values: ["WxL", "US", "EU", "JP", "Letter"],
    usage: [{ table: "BottomSize", column: "type" }],
  },
  SizeType: {
    values: ["WxL", "US", "EU", "JP", "Letter", "Universal"],
    usage: [{ table: "Size", column: "type" }],
  },
  QuestionType: {
    values: ["MultipleChoice", "FreeResponse"],
    usage: [{ table: "ProductVariantFeedbackQuestion", column: "type" }],
  },
  Rating: {
    values: ["Disliked", "Ok", "Loved"],
    usage: [{ table: "ReservationFeedback", column: "rating" }],
  },
  LetterSize: {
    values: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    usage: [{ table: "TopSize", column: "letter" }],
  },
  ProductArchitecture: {
    values: ["Fashion", "Showstopper", "Staple"],
    usage: [{ table: "Product", column: "architecture" }],
  },
  WarehouseLocationType: {
    values: ["Conveyor", "Rail", "Bin"],
    usage: [{ table: "WarehouseLocation", column: "type" }],
  },
  PhotographyStatus: {
    values: ["Done", "InProgress", "ReadyForEditing", "ReadyToShoot", "Steam"],
    usage: [{ table: "Product", column: "photographyStatus" }],
  },
  EmailId: {
    values: [
      "CompleteAccount",
      "BuyUsedOrderConfirmation",
      "DaySevenAuthorizationFollowup",
      "DaySixAuthorizationFollowup",
      "DayFiveAuthorizationFollowup",
      "DayFourAuthorizationFollowup",
      "DayThreeAuthorizationFollowup",
      "DayTwoAuthorizationFollowup",
      "FreeToReserve",
      "Paused",
      "PriorityAccess",
      "ReferralConfirmation",
      "ReservationConfirmation",
      "ReservationReturnConfirmation",
      "ResumeConfirmation",
      "ResumeReminder",
      "ReturnReminder",
      "Rewaitlisted",
      "SubmittedEmail",
      "TwentyFourHourAuthorizationFollowup",
      "Waitlisted",
      "WelcomeToSeasons",
      "UnpaidMembership",
      "ReturnToGoodStanding",
      "RecommendedItemsNurture",
    ],
    usage: [{ table: "EmailReceipt", column: "emailId" }],
  },
  PackageTransitEventStatus: {
    values: [
      "Delivered",
      "Failure",
      "PreTransit",
      "Returned",
      "Transit",
      "Unknown",
    ],
    usage: [{ table: "PackageTransitEvent", column: "status" }],
  },
  PackageTransitEventSubStatus: {
    values: [
      "AddressIssue",
      "ContactCarrier",
      "Delayed",
      "Delivered",
      "DeliveryAttempted",
      "DeliveryRescheduled",
      "DeliveryScheduled",
      "InformationReceived",
      "LocationInaccessible",
      "NoticeLeft",
      "Other",
      "OutForDelivery",
      "PackageAccepted",
      "PackageArrived",
      "PackageDamaged",
      "PackageDeparted",
      "PackageDisposed",
      "PackageForwarded",
      "PackageHeld",
      "PackageLost",
      "PackageProcessed",
      "PackageProcessing",
      "PackageUnclaimed",
      "PackageUndeliverable",
      "PickupAvailable",
      "RescheduleDelivery",
      "ReturnToSender",
    ],
    usage: [{ table: "PackageTransitEvent", column: "subStatus" }],
  },
  ReservationPhase: {
    values: ["BusinessToCustomer", "CustomerToBusiness"],
    usage: [{ table: "Reservation", column: "phase" }],
  },
  UserPushNotificationInterestType: {
    values: ["Bag", "Blog", "Brand", "General", "NewProduct"],
    usage: [{ table: "UserPushNotificationInterest", column: "type" }],
  },
  InAdmissableReason: {
    values: [
      "Untriageable",
      "UnsupportedPlatform",
      "AutomaticAdmissionsFlagOff",
      "UnserviceableZipcode",
      "InsufficientInventory",
      "OpsThresholdExceeded",
    ],
    usage: [{ table: "CustomerAdmissionsData", column: "inAdmissableReason" }],
  },
  ShippingCode: {
    values: ["UPSGround", "UPSSelect"],
    usage: [{ table: "ShippingMethod", column: "code" }],
  },
  CollectionPlacement: {
    values: ["Homepage"],
    usage: [{ table: "Collection", column: "placements", isArray: true }],
  },
  PhysicalProductDamageType: {
    values: [
      "BarcodeMissing",
      "ButtonMissing",
      "Stain",
      "Smell",
      "Tear",
      "Other",
    ],
    usage: [
      { table: "PhysicalProductQualityReport", column: "damageType" },
      {
        table: "PhysicalProductQualityReport",
        column: "damageTypes",
        isArray: true,
      },
    ],
  },
  ProductFit: {
    values: ["RunsBig", "TrueToSize", "RunsSmall"],
    usage: [{ table: "Product", column: "productFit" }],
  },
  ProductNotificationType: {
    values: ["Restock", "AvailableForPurchase"],
    usage: [{ table: "ProductNotification", column: "type" }],
  },
  PaymentPlanTier: {
    values: ["Essential", "AllAccess", "Pause"],
    usage: [{ table: "PaymentPlan", column: "tier" }],
  },
  SmsStatus: {
    values: [
      "Queued",
      "Sending",
      "Sent",
      "Failed",
      "Delivered",
      "Undelivered",
      "Receiving",
      "Received",
      "Accepted",
      "Scheduled",
      "Read",
      "PartiallyDelivered",
    ],
    usage: [{ table: "SmsReceipt", column: "status" }],
  },
  SeasonCode: {
    values: ["FW", "SS", "PS", "PF", "HO", "AW"],
    usage: [{ table: "Season", column: "seasonCode" }],
  },
  SeasonString: {
    values: ["Spring", "Summer", "Winter", "Fall"],
    usage: [
      { table: "ProductSeason", column: "wearableSeasons", isArray: true },
    ],
  },
  UserVerificationMethod: {
    values: ["SMS", "Email", "None"],
    usage: [{ table: "User", column: "verificationMethod" }],
  },
  UserVerificationStatus: {
    values: ["Approved", "Denied", "Pending"],
    usage: [{ table: "User", column: "verificationStatus" }],
  },
  PushNotificationStatus: {
    values: ["Blocked", "Granted", "Denied"],
    usage: [{ table: "User", column: "pushNotificationStatus" }],
  },
  FitPicStatus: {
    values: ["Submitted", "Published", "Unpublished"],
    usage: [{ table: "FitPic", column: "status" }],
  },
  FitPicReportStatus: {
    values: ["Pending", "Reviewed"],
    usage: [{ table: "FitPicReport", column: "status" }],
  },
  CustomerStyle: {
    values: [
      "AvantGarde",
      "Bold",
      "Classic",
      "Minimalist",
      "Streetwear",
      "Techwear",
    ],
    usage: [
      { table: "Brand", column: "styles", isArray: true },
      { table: "Product", column: "styles", isArray: true },
      { table: "CustomerDetail", column: "styles", isArray: true },
    ],
  },
  NotificationBarID: {
    values: ["PastDueInvoice", "TestDismissable", "AuthorizedReminder"],
    usage: [
      {
        table: "CustomerNotificationBarReceipt",
        column: "notificationBarId",
      },
    ],
  },
  PauseType: {
    values: ["WithItems", "WithoutItems"],
    usage: [{ table: "PauseRequest", column: "pauseType" }],
  },
  OrderType: {
    values: ["Used", "New"],
    usage: [{ table: "Order", column: "type" }],
  },
  OrderLineItemRecordType: {
    values: [
      "PhysicalProduct",
      "ProductVariant",
      "ExternalProduct",
      "Package",
      "EarlySwap",
      "Reservation",
    ],
    usage: [{ table: "OrderLineItem", column: "recordType" }],
  },
  OrderStatus: {
    values: ["Drafted", "Submitted", "Fulfilled", "Returned", "Cancelled"],
    usage: [{ table: "Order", column: "status" }],
  },
  OrderCancelReason: {
    values: ["Customer", "Declined", "Fraud", "Inventory", "Other"],
    usage: [{ table: "Order", column: "cancelReason" }],
  },
  OrderPaymentStatus: {
    values: ["Paid", "PartiallyPaid", "Refunded", "NotPaid", "Complete"],
    usage: [{ table: "Order", column: "paymentStatus" }],
  },
  AdminAction: {
    values: ["Insert", "Delete", "Update", "Truncate"],
    usage: [{ table: "AdminActionLog", column: "action" }],
  },
  SyncTimingType: {
    values: ["Drip", "Next", "Impact"],
    usage: [{ table: "SyncTiming", column: "type" }],
  },
}

const IntLists = [
  { table: "CustomerDetail", val: "waistSizes" },
  { table: "CustomerDetail", val: "weight" },
]

const generateScalarListMigration = () => {
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

const generateRelationsMigration = () => {
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

const parseEnumsFromPrismaOne = () => {
  const enumObject = {}
  const f = fs.readFileSync("prisma1/datamodel.prisma", "utf-8")

  const lines = f.split(/\r?\n/)

  let inEnum = false
  let currentEnumName = null
  let inTable = false
  let currentTableName = null

  // Create the enumObject
  for (const line of lines) {
    if (!inEnum && line.startsWith("enum")) {
      inEnum = true
      const lineParts = line.split(" ")
      const enumName = lineParts[1]
      enumObject[enumName] = { values: [], usage: [] }
      currentEnumName = enumName
    } else if (inEnum && line.includes("}")) {
      inEnum = false
      currentEnumName = null
    } else if (inEnum) {
      const lineWithoutSpaces = line.replace(/ /g, "")
      // pure comment
      if (lineWithoutSpaces.startsWith("#")) {
        console.log(`skipping: ${lineWithoutSpaces}`)
        continue
      }
      // enum without comment
      const lineWithoutComments = lineWithoutSpaces.split("#")[0]
      enumObject[currentEnumName].values.push(lineWithoutComments)
    }
  }

  const enumNames = Object.keys(enumObject)
  for (const line of lines) {
    if (!inTable && line.startsWith("type")) {
      inTable = true
      const lineParts = line.split(" ")
      currentTableName = lineParts[1]
    } else if (inTable && line.includes("}")) {
      inTable = false
      currentTableName = null
    } else if (inTable) {
      const enumSpotted = enumNames.some(a => line.includes(a))
      if (enumSpotted) {
        const enumInLine = enumNames.filter(a => line.includes(a))[0]
        enumObject[enumInLine].usage.push({
          table: currentTableName,
          column: line.split(":")[0].replace(/ /g, ""),
        })
        // console.log(`enum line: ${line}`)
      }
      // If an enum is in the line, console log it
    }
  }

  console.dir(enumObject, { depth: null })
}

const checkEnumsObject = () => {
  console.log(Object.keys(ENUMS).length)
}
const generateEnumsMigrate = () => {
  const valueArrayToValueString = values => {
    let string = ""
    values.forEach((val, i) => {
      if (i == 0) {
        string += `'${val}'`
      } else {
        string += `, '${val}'`
      }
    })
    return string
  }
  for (const [enumName, { values, usage }] of Object.entries(ENUMS)) {
    console.log(
      `CREATE TYPE "${enumName}" AS ENUM (${valueArrayToValueString(values)});`
    )

    // Fix some bad data for order payment status
    if (enumName == "OrderPaymentStatus") {
      console.log(`
UPDATE monsoon$dev."Order"
SET "paymentStatus" = 'Complete'
WHERE  monsoon$dev."Order"."paymentStatus" = 'complete';
      `)
    }
    for (const { table, column, isArray } of usage) {
      const typeSuffix = isArray ? "[]" : ""
      console.log(
        `ALTER TABLE monsoon$dev."${table}" ALTER COLUMN "${column}" TYPE "${enumName}"${typeSuffix} USING "${column}"::text${typeSuffix}::"${enumName}"${typeSuffix};`
      )
    }
    console.log(`\n`)
  }
}

// generateScalarListMigration()
// generateRelationsMigration()
// parseEnumsFromPrismaOne()
generateEnumsMigrate()
// checkEnumsObject()
