-- CreateEnum
CREATE TYPE "ProductTierName" AS ENUM ('Standard', 'Luxury');

-- CreateEnum
CREATE TYPE "CollectionPlacement" AS ENUM ('Homepage');

-- CreateEnum
CREATE TYPE "BrandTier" AS ENUM ('Tier0', 'Tier1', 'Tier2', 'Niche', 'Upcoming', 'Retro', 'Boutique', 'Local', 'Discovery');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('Clothes', 'Bags', 'Accessories', 'Jewelry');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('Office', 'Warehouse', 'Cleaner', 'Customer');

-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('Inches', 'Millimeters');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('Invited', 'Created', 'Waitlisted', 'Authorized', 'Active', 'Suspended', 'PaymentFailed', 'Paused', 'Deactivated');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Customer', 'Partner', 'Marketer');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('NonReservable', 'Reservable', 'Reserved', 'Stored', 'Offloaded');

-- CreateEnum
CREATE TYPE "PhysicalProductStatus" AS ENUM ('New', 'Used', 'Dirty', 'Damaged', 'PermanentlyDamaged', 'Clean', 'Lost', 'Sold');

-- CreateEnum
CREATE TYPE "PhysicalProductOffloadMethod" AS ENUM ('SoldToUser', 'SoldToThirdParty', 'ReturnedToVendor', 'Recycled', 'Unknown');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('Available', 'NotAvailable', 'Stored', 'Offloaded');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('Queued', 'Shipped', 'Delivered', 'Blocked', 'Received', 'Cancelled');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('Queued', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Hold', 'Blocked', 'Unknown', 'Lost', 'Received');

-- CreateEnum
CREATE TYPE "BagItemStatus" AS ENUM ('Added', 'Reserved', 'Received');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('AllAccess', 'Essential');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('Top', 'Bottom', 'Accessory', 'Shoe');

-- CreateEnum
CREATE TYPE "BottomSizeType" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter');

-- CreateEnum
CREATE TYPE "SizeType" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter', 'Universal');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MultipleChoice', 'FreeResponse');

-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('Disliked', 'Ok', 'Loved');

-- CreateEnum
CREATE TYPE "LetterSize" AS ENUM ('XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- CreateEnum
CREATE TYPE "ProductArchitecture" AS ENUM ('Fashion', 'Showstopper', 'Staple');

-- CreateEnum
CREATE TYPE "WarehouseLocationType" AS ENUM ('Conveyor', 'Rail', 'Bin');

-- CreateEnum
CREATE TYPE "PhotographyStatus" AS ENUM ('Done', 'InProgress', 'ReadyForEditing', 'ReadyToShoot', 'Steam');

-- CreateEnum
CREATE TYPE "EmailId" AS ENUM ('CompleteAccount', 'BuyUsedOrderConfirmation', 'DaySevenAuthorizationFollowup', 'DaySixAuthorizationFollowup', 'DayFiveAuthorizationFollowup', 'DayFourAuthorizationFollowup', 'DayThreeAuthorizationFollowup', 'DayTwoAuthorizationFollowup', 'FreeToReserve', 'Paused', 'PriorityAccess', 'ReferralConfirmation', 'ReservationConfirmation', 'ReservationReturnConfirmation', 'ResumeConfirmation', 'ResumeReminder', 'ReturnReminder', 'Rewaitlisted', 'SubmittedEmail', 'TwentyFourHourAuthorizationFollowup', 'Waitlisted', 'WelcomeToSeasons', 'UnpaidMembership', 'ReturnToGoodStanding', 'RecommendedItemsNurture');

-- CreateEnum
CREATE TYPE "PackageTransitEventStatus" AS ENUM ('Delivered', 'Failure', 'PreTransit', 'Returned', 'Transit', 'Unknown');

-- CreateEnum
CREATE TYPE "PackageTransitEventSubStatus" AS ENUM ('AddressIssue', 'ContactCarrier', 'Delayed', 'Delivered', 'DeliveryAttempted', 'DeliveryRescheduled', 'DeliveryScheduled', 'InformationReceived', 'LocationInaccessible', 'NoticeLeft', 'Other', 'OutForDelivery', 'PackageAccepted', 'PackageArrived', 'PackageDamaged', 'PackageDeparted', 'PackageDisposed', 'PackageForwarded', 'PackageHeld', 'PackageLost', 'PackageProcessed', 'PackageProcessing', 'PackageUnclaimed', 'PackageUndeliverable', 'PickupAvailable', 'RescheduleDelivery', 'ReturnToSender');

-- CreateEnum
CREATE TYPE "ReservationPhase" AS ENUM ('BusinessToCustomer', 'CustomerToBusiness');

-- CreateEnum
CREATE TYPE "UserPushNotificationInterestType" AS ENUM ('Bag', 'Blog', 'Brand', 'General', 'NewProduct');

-- CreateEnum
CREATE TYPE "InAdmissableReason" AS ENUM ('Untriageable', 'UnsupportedPlatform', 'AutomaticAdmissionsFlagOff', 'UnserviceableZipcode', 'InsufficientInventory', 'OpsThresholdExceeded');

-- CreateEnum
CREATE TYPE "ShippingCode" AS ENUM ('UPSGround', 'UPSSelect');

-- CreateEnum
CREATE TYPE "PhysicalProductDamageType" AS ENUM ('BarcodeMissing', 'ButtonMissing', 'Stain', 'Smell', 'Tear', 'Other');

-- CreateEnum
CREATE TYPE "ProductFit" AS ENUM ('RunsBig', 'TrueToSize', 'RunsSmall');

-- CreateEnum
CREATE TYPE "ProductNotificationType" AS ENUM ('Restock', 'AvailableForPurchase');

-- CreateEnum
CREATE TYPE "PaymentPlanTier" AS ENUM ('Essential', 'AllAccess', 'Pause');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('Queued', 'Sending', 'Sent', 'Failed', 'Delivered', 'Undelivered', 'Receiving', 'Received', 'Accepted', 'Scheduled', 'Read', 'PartiallyDelivered');

-- CreateEnum
CREATE TYPE "SeasonCode" AS ENUM ('FW', 'SS', 'PS', 'PF', 'HO', 'AW');

-- CreateEnum
CREATE TYPE "SeasonString" AS ENUM ('Spring', 'Summer', 'Winter', 'Fall');

-- CreateEnum
CREATE TYPE "UserVerificationMethod" AS ENUM ('SMS', 'Email', 'None');

-- CreateEnum
CREATE TYPE "UserVerificationStatus" AS ENUM ('Approved', 'Denied', 'Pending');

-- CreateEnum
CREATE TYPE "PushNotificationStatus" AS ENUM ('Blocked', 'Granted', 'Denied');

-- CreateEnum
CREATE TYPE "FitPicStatus" AS ENUM ('Submitted', 'Published', 'Unpublished');

-- CreateEnum
CREATE TYPE "FitPicReportStatus" AS ENUM ('Pending', 'Reviewed');

-- CreateEnum
CREATE TYPE "CustomerStyle" AS ENUM ('AvantGarde', 'Bold', 'Classic', 'Minimalist', 'Streetwear', 'Techwear');

-- CreateEnum
CREATE TYPE "NotificationBarID" AS ENUM ('PastDueInvoice', 'TestDismissable', 'AuthorizedReminder');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('Used', 'New');

-- CreateEnum
CREATE TYPE "PauseType" AS ENUM ('WithItems', 'WithoutItems');

-- CreateEnum
CREATE TYPE "OrderLineItemRecordType" AS ENUM ('PhysicalProduct', 'ProductVariant', 'ExternalProduct', 'Package', 'EarlySwap', 'Reservation');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Drafted', 'Submitted', 'Fulfilled', 'Returned', 'Cancelled');

-- CreateEnum
CREATE TYPE "OrderCancelReason" AS ENUM ('Customer', 'Declined', 'Fraud', 'Inventory', 'Other');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('Paid', 'PartiallyPaid', 'Refunded', 'NotPaid', 'Complete');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('Insert', 'Delete', 'Update', 'Truncate');

-- CreateEnum
CREATE TYPE "SyncTimingType" AS ENUM ('Drip', 'Next', 'Impact');

-- CreateTable
CREATE TABLE "AccessorySize" (
    "id" VARCHAR(30) NOT NULL,
    "bridge" DECIMAL(65,30),
    "length" DECIMAL(65,30),
    "width" DECIMAL(65,30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveAdminUser" (
    "id" VARCHAR(30) NOT NULL,
    "admin" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "actionId" SERIAL NOT NULL,
    "entityId" VARCHAR(30) NOT NULL,
    "tableName" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL,
    "action" "AdminAction" NOT NULL,
    "rowData" JSON NOT NULL,
    "changedFields" JSON,
    "statementOnly" BOOLEAN NOT NULL,
    "activeAdminUser" VARCHAR(30),
    "interpretedAt" TIMESTAMP(3),

    PRIMARY KEY ("actionId")
);

-- CreateTable
CREATE TABLE "AdminActionLogInterpretation" (
    "id" VARCHAR(30) NOT NULL,
    "entityId" VARCHAR(30) NOT NULL,
    "tableName" TEXT NOT NULL,
    "interpretation" TEXT,
    "data" JSON,
    "log" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BagItem" (
    "id" VARCHAR(30) NOT NULL,
    "position" INTEGER,
    "saved" BOOLEAN,
    "status" "BagItemStatus" NOT NULL,
    "customer" VARCHAR(30),
    "productVariant" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInfo" (
    "id" VARCHAR(30) NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT,
    "last_digits" TEXT NOT NULL,
    "expiration_month" INTEGER NOT NULL,
    "expiration_year" INTEGER NOT NULL,
    "street1" TEXT,
    "street2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" VARCHAR(30) NOT NULL,
    "webflowId" TEXT NOT NULL,
    "webflowCreatedAt" TIMESTAMP(3) NOT NULL,
    "webflowUpdatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "body" TEXT,
    "summary" TEXT,
    "thumbnailURL" TEXT,
    "imageURL" TEXT,
    "imageAlt" TEXT,
    "url" TEXT,
    "author" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedOn" TIMESTAMP(3) NOT NULL,
    "image" VARCHAR(30),
    "content" TEXT,
    "published" BOOLEAN NOT NULL,
    "tags" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BottomSize" (
    "id" VARCHAR(30) NOT NULL,
    "type" "BottomSizeType",
    "value" TEXT,
    "waist" DECIMAL(65,30),
    "rise" DECIMAL(65,30),
    "hem" DECIMAL(65,30),
    "inseam" DECIMAL(65,30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "brandCode" TEXT NOT NULL,
    "description" TEXT,
    "isPrimaryBrand" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "since" TIMESTAMP(3),
    "tier" "BrandTier" NOT NULL,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "basedIn" TEXT,
    "designer" TEXT,
    "published" BOOLEAN NOT NULL,
    "featured" BOOLEAN NOT NULL,
    "logo" JSON,
    "logoImage" VARCHAR(30),
    "shopifyShop" VARCHAR(30),
    "styles" "CustomerStyle"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" JSON,
    "visible" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "productType" "ProductType",
    "measurementType" "MeasurementType",

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "subTitle" TEXT,
    "published" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "displayTextOverlay" BOOLEAN NOT NULL,
    "textOverlayColor" TEXT,
    "descriptions" TEXT[],
    "placements" "CollectionPlacement"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" VARCHAR(30) NOT NULL,
    "status" "CustomerStatus",
    "detail" VARCHAR(30),
    "user" VARCHAR(30),
    "plan" "Plan",
    "billingInfo" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorizedAt" TIMESTAMP(3),
    "admissions" VARCHAR(30),
    "referralLink" TEXT,
    "referrerId" TEXT,
    "referrer" VARCHAR(30),
    "utm" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAdmissionsData" (
    "id" VARCHAR(30) NOT NULL,
    "inServiceableZipcode" BOOLEAN NOT NULL,
    "admissable" BOOLEAN NOT NULL,
    "inAdmissableReason" "InAdmissableReason",
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorizationsCount" INTEGER NOT NULL,
    "allAccessEnabled" BOOLEAN NOT NULL,
    "authorizationWindowClosesAt" TIMESTAMP(3),
    "subscribedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerDetail" (
    "id" VARCHAR(30) NOT NULL,
    "phoneNumber" TEXT,
    "birthday" TIMESTAMP(3),
    "height" INTEGER,
    "bodyType" TEXT,
    "averageTopSize" TEXT,
    "averageWaistSize" TEXT,
    "averagePantLength" TEXT,
    "preferredPronouns" TEXT,
    "profession" TEXT,
    "partyFrequency" TEXT,
    "travelFrequency" TEXT,
    "shoppingFrequency" TEXT,
    "averageSpend" TEXT,
    "style" TEXT,
    "commuteStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shippingAddress" VARCHAR(30),
    "phoneOS" TEXT,
    "insureShipment" BOOLEAN NOT NULL,
    "stylePreferences" VARCHAR(30),
    "instagramHandle" TEXT,
    "impactId" TEXT,
    "discoveryReference" TEXT,
    "weight" INTEGER[],
    "topSizes" TEXT[],
    "waistSizes" INTEGER[],
    "styles" "CustomerStyle"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerMembership" (
    "id" VARCHAR(30) NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "customer" VARCHAR(30),
    "plan" VARCHAR(30),
    "giftId" TEXT,
    "subscription" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerMembershipSubscriptionData" (
    "id" VARCHAR(30) NOT NULL,
    "planID" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "currentTermStart" TIMESTAMP(3) NOT NULL,
    "currentTermEnd" TIMESTAMP(3) NOT NULL,
    "nextBillingAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "planPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNotificationBarReceipt" (
    "id" VARCHAR(30) NOT NULL,
    "notificationBarId" "NotificationBarID" NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "clickCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customer" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailReceipt" (
    "id" VARCHAR(30) NOT NULL,
    "emailId" "EmailId" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitPic" (
    "id" VARCHAR(30) NOT NULL,
    "status" "FitPicStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(30),
    "user" VARCHAR(30),
    "image" VARCHAR(30),
    "includeInstagramHandle" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitPicReport" (
    "id" VARCHAR(30) NOT NULL,
    "status" "FitPicReportStatus" NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reporter" VARCHAR(30),
    "reported" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" VARCHAR(30) NOT NULL,
    "caption" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "height" INTEGER,
    "width" INTEGER,
    "alt" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestedUser" (
    "id" VARCHAR(30) NOT NULL,
    "email" TEXT NOT NULL,
    "zipcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "id" VARCHAR(30) NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "trackingNumber" TEXT,
    "trackingURL" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Launch" (
    "id" VARCHAR(30) NOT NULL,
    "published" BOOLEAN NOT NULL,
    "launchAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collection" VARCHAR(30),
    "brand" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT,
    "name" TEXT,
    "company" TEXT,
    "description" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT NOT NULL,
    "locationType" "LocationType",
    "lat" DECIMAL(65,30),
    "lng" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user" VARCHAR(30),
    "country" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" VARCHAR(30) NOT NULL,
    "subTotal" INTEGER,
    "total" INTEGER,
    "couponID" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "cancelReason" "OrderCancelReason",
    "paymentStatus" "OrderPaymentStatus" NOT NULL,
    "customer" VARCHAR(30),
    "sentPackage" VARCHAR(30),
    "orderNumber" TEXT NOT NULL,
    "externalID" VARCHAR(25),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "id" VARCHAR(30) NOT NULL,
    "recordID" VARCHAR(30) NOT NULL,
    "recordType" "OrderLineItemRecordType" NOT NULL,
    "needShipping" BOOLEAN,
    "taxRate" DECIMAL(65,30),
    "taxName" TEXT,
    "taxPercentage" DECIMAL(65,30),
    "taxPrice" INTEGER,
    "price" INTEGER NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "reservation" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" VARCHAR(30) NOT NULL,
    "weight" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromAddress" VARCHAR(30),
    "toAddress" VARCHAR(30),
    "shippingLabel" VARCHAR(30),
    "transactionID" TEXT NOT NULL,
    "cost" INTEGER,
    "status" "PackageStatus",

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageTransitEvent" (
    "id" VARCHAR(30) NOT NULL,
    "status" "PackageTransitEventStatus" NOT NULL,
    "subStatus" "PackageTransitEventSubStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSON NOT NULL,
    "package" VARCHAR(30),
    "reservation" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PauseReason" (
    "id" VARCHAR(25) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PauseRequest" (
    "id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pausePending" BOOLEAN NOT NULL,
    "pauseDate" TIMESTAMP(3),
    "resumeDate" TIMESTAMP(3),
    "membership" VARCHAR(30),
    "notified" BOOLEAN NOT NULL,
    "pauseType" "PauseType" NOT NULL,
    "reason" VARCHAR(25),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "planID" TEXT NOT NULL,
    "status" TEXT,
    "name" TEXT,
    "price" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tagline" TEXT,
    "itemCount" INTEGER,
    "tier" "PaymentPlanTier",

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalProduct" (
    "id" VARCHAR(30) NOT NULL,
    "seasonsUID" TEXT NOT NULL,
    "inventoryStatus" "InventoryStatus" NOT NULL,
    "productStatus" "PhysicalProductStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(30),
    "offloadMethod" "PhysicalProductOffloadMethod",
    "offloadNotes" TEXT,
    "sequenceNumber" INTEGER NOT NULL,
    "warehouseLocation" VARCHAR(30),
    "dateOrdered" TIMESTAMP(3),
    "dateReceived" TIMESTAMP(3),
    "unitCost" DECIMAL(65,30),
    "barcoded" BOOLEAN,
    "price" VARCHAR(30),
    "packedAt" TIMESTAMP(3),
    "productVariant" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalProductPrice" (
    "id" VARCHAR(30) NOT NULL,
    "buyUsedEnabled" BOOLEAN NOT NULL,
    "buyUsedPrice" DECIMAL(65,30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalProductQualityReport" (
    "id" VARCHAR(30) NOT NULL,
    "damageType" "PhysicalProductDamageType",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "physicalProduct" VARCHAR(30),
    "user" VARCHAR(30),
    "score" INTEGER,
    "published" BOOLEAN NOT NULL,
    "damageTypes" "PhysicalProductDamageType"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "externalURL" TEXT,
    "retailPrice" INTEGER,
    "status" "ProductStatus",
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" VARCHAR(30),
    "color" VARCHAR(30),
    "secondaryColor" VARCHAR(30),
    "brand" VARCHAR(30),
    "type" "ProductType",
    "modelSize" VARCHAR(30),
    "architecture" "ProductArchitecture",
    "publishedAt" TIMESTAMP(3),
    "photographyStatus" "PhotographyStatus",
    "season" VARCHAR(30),
    "productFit" "ProductFit",
    "buyNewEnabled" BOOLEAN NOT NULL,
    "tier" VARCHAR(30),
    "outerMaterials" TEXT[],
    "innerMaterials" TEXT[],
    "styles" "CustomerStyle"[],
    "materialCategory" VARCHAR(30),
    "model" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFunction" (
    "id" VARCHAR(30) NOT NULL,
    "name" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMaterialCategory" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "category" VARCHAR(30),
    "lifeExpectancy" DECIMAL(65,30) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductModel" (
    "id" VARCHAR(30) NOT NULL,
    "name" TEXT NOT NULL,
    "height" DECIMAL(65,30) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductNotification" (
    "id" VARCHAR(30) NOT NULL,
    "type" "ProductNotificationType" NOT NULL,
    "shouldNotify" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productVariant" VARCHAR(30),
    "physicalProduct" VARCHAR(30),
    "customer" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRequest" (
    "id" VARCHAR(30) NOT NULL,
    "sku" TEXT,
    "brand" TEXT,
    "description" TEXT,
    "name" TEXT,
    "price" INTEGER,
    "priceCurrency" TEXT,
    "productID" TEXT,
    "url" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "user" VARCHAR(30),
    "images" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSeason" (
    "id" VARCHAR(30) NOT NULL,
    "vendorSeason" VARCHAR(30),
    "internalSeason" VARCHAR(30),
    "wearableSeasons" "SeasonString"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTier" (
    "id" VARCHAR(30) NOT NULL,
    "tier" "ProductTierName" NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" VARCHAR(30) NOT NULL,
    "sku" TEXT,
    "weight" DECIMAL(65,30),
    "height" DECIMAL(65,30),
    "retailPrice" DECIMAL(65,30),
    "total" INTEGER NOT NULL,
    "reservable" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL,
    "nonReservable" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "color" VARCHAR(30),
    "internalSize" VARCHAR(30),
    "offloaded" INTEGER NOT NULL,
    "stored" INTEGER NOT NULL,
    "displayShort" TEXT NOT NULL,
    "price" VARCHAR(30),
    "product" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantFeedback" (
    "id" VARCHAR(30) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "variant" VARCHAR(30),
    "rating" DECIMAL(65,30),
    "review" TEXT,
    "reservationFeedback" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantFeedbackQuestion" (
    "id" VARCHAR(30) NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" TEXT[],
    "responses" TEXT[],
    "variantFeedback" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantPrice" (
    "id" VARCHAR(30) NOT NULL,
    "retailPrice" DECIMAL(65,30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantWant" (
    "id" VARCHAR(30) NOT NULL,
    "isFulfilled" BOOLEAN NOT NULL,
    "productVariant" VARCHAR(30),
    "user" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushNotificationReceipt" (
    "id" VARCHAR(30) NOT NULL,
    "route" TEXT,
    "screen" TEXT,
    "uri" TEXT,
    "body" TEXT NOT NULL,
    "title" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interest" TEXT,
    "recordID" TEXT,
    "recordSlug" TEXT,
    "notificationKey" TEXT,
    "userPushNotification" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentlyViewedProduct" (
    "id" VARCHAR(30) NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "product" VARCHAR(30),
    "customer" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" VARCHAR(30) NOT NULL,
    "shipped" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user" VARCHAR(30),
    "reservationNumber" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "lastLocation" VARCHAR(30),
    "customer" VARCHAR(30),
    "sentPackage" VARCHAR(30),
    "returnedPackage" VARCHAR(30),
    "reminderSentAt" TIMESTAMP(3),
    "receipt" VARCHAR(30),
    "phase" "ReservationPhase" NOT NULL,
    "statusUpdatedAt" TIMESTAMP(3),
    "shippingOption" VARCHAR(30),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationFeedback" (
    "id" VARCHAR(30) NOT NULL,
    "comment" TEXT,
    "rating" "Rating",
    "user" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reservation" VARCHAR(30),
    "respondedAt" TIMESTAMP(3),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationReceipt" (
    "id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationReceiptItem" (
    "id" VARCHAR(30) NOT NULL,
    "productStatus" "PhysicalProductStatus" NOT NULL,
    "notes" TEXT,
    "product" VARCHAR(30),
    "receipt" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" VARCHAR(30) NOT NULL,
    "year" INTEGER,
    "seasonCode" "SeasonCode",

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingMethod" (
    "id" VARCHAR(30) NOT NULL,
    "code" "ShippingCode" NOT NULL,
    "displayText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingOption" (
    "id" VARCHAR(30) NOT NULL,
    "externalCost" INTEGER,
    "averageDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "destination" VARCHAR(30),
    "origin" VARCHAR(30),
    "shippingMethod" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyProductVariant" (
    "id" VARCHAR(30) NOT NULL,
    "externalId" TEXT,
    "cachedPrice" DECIMAL(65,30),
    "cachedAvailableForSale" BOOLEAN,
    "cacheExpiresAt" TIMESTAMP(3),
    "displayName" TEXT,
    "title" TEXT,
    "image" VARCHAR(30),
    "brand" VARCHAR(30),
    "productVariant" VARCHAR(30),
    "shop" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyProductVariantSelectedOption" (
    "id" VARCHAR(30) NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "shopifyProductVariant" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "productType" "ProductType",
    "display" TEXT NOT NULL,
    "top" VARCHAR(30),
    "bottom" VARCHAR(30),
    "type" "SizeType",
    "accessory" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsReceipt" (
    "id" VARCHAR(30) NOT NULL,
    "externalId" TEXT,
    "body" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "smsId" TEXT,
    "mediaUrls" TEXT[],
    "user" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StylePreferences" (
    "id" VARCHAR(30) NOT NULL,
    "styles" TEXT[],
    "patterns" TEXT[],
    "colors" TEXT[],
    "brands" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncTiming" (
    "id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "SyncTimingType" NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "detail" TEXT,
    "customer" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" VARCHAR(30) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopSize" (
    "id" VARCHAR(30) NOT NULL,
    "letter" "LetterSize",
    "sleeve" DECIMAL(65,30),
    "shoulder" DECIMAL(65,30),
    "chest" DECIMAL(65,30),
    "neck" DECIMAL(65,30),
    "length" DECIMAL(65,30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(30) NOT NULL,
    "auth0Id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pushNotificationStatus" "PushNotificationStatus" NOT NULL,
    "verificationStatus" "UserVerificationStatus" NOT NULL,
    "verificationMethod" "UserVerificationMethod" NOT NULL,
    "pushNotification" VARCHAR(30),
    "sendSystemEmails" BOOLEAN NOT NULL,
    "deviceData" VARCHAR(30),
    "roles" "UserRole"[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDeviceData" (
    "id" VARCHAR(30) NOT NULL,
    "iOSVersion" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPushNotification" (
    "id" VARCHAR(30) NOT NULL,
    "status" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPushNotificationInterest" (
    "id" VARCHAR(30) NOT NULL,
    "type" "UserPushNotificationInterestType" NOT NULL,
    "value" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "user" VARCHAR(30),
    "userPushNotification" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UTMData" (
    "id" VARCHAR(30) NOT NULL,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "term" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseLocation" (
    "id" VARCHAR(30) NOT NULL,
    "type" "WarehouseLocationType" NOT NULL,
    "barcode" TEXT NOT NULL,
    "locationCode" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarehouseLocationConstraint" (
    "id" VARCHAR(30) NOT NULL,
    "limit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "category" VARCHAR(30),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopifyShop" (
    "id" VARCHAR(30) NOT NULL,
    "shopName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT[],

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrandToBrandImages" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_CategoryToChildren" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_CollectionToImage" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_CollectionToProduct" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_CustomerToEmailedProducts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_FitPicToProduct" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ImageToProduct" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_OrderToOrderLineItem" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_PackageToPhysicalProduct" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ReservationToAllProducts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ReservationToNewProducts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ReservationToReturnedProducts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToProductFunction" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToTag" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductVariantManufacturerSize" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_UserToPushNotificationReceipts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_WarehouseLocationToWarehouseLocationConstraint" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost.slug_unique" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand.slug_unique" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand.brandCode_unique" ON "Brand"("brandCode");

-- CreateIndex
CREATE UNIQUE INDEX "Category.slug_unique" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category.name_unique" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Collection.slug_unique" ON "Collection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Color.slug_unique" ON "Color"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Color.colorCode_unique" ON "Color"("colorCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer.referralLink_unique" ON "Customer"("referralLink");

-- CreateIndex
CREATE UNIQUE INDEX "Image.url_unique" ON "Image"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Location.slug_unique" ON "Location"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order.orderNumber_unique" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentPlan.planID_unique" ON "PaymentPlan"("planID");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalProduct.seasonsUID_unique" ON "PhysicalProduct"("seasonsUID");

-- CreateIndex
CREATE UNIQUE INDEX "Product.slug_unique" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFunction.name_unique" ON "ProductFunction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMaterialCategory.slug_unique" ON "ProductMaterialCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductModel.name_unique" ON "ProductModel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant.sku_unique" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation.reservationNumber_unique" ON "Reservation"("reservationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyProductVariant.externalId_unique" ON "ShopifyProductVariant"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Size.slug_unique" ON "Size"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag.name_unique" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User.auth0Id_unique" ON "User"("auth0Id");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseLocation.barcode_unique" ON "WarehouseLocation"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyShop.shopName_unique" ON "ShopifyShop"("shopName");

-- CreateIndex
CREATE UNIQUE INDEX "_BrandToBrandImages_AB_unique" ON "_BrandToBrandImages"("A", "B");

-- CreateIndex
CREATE INDEX "_BrandToBrandImages_B_index" ON "_BrandToBrandImages"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToChildren_AB_unique" ON "_CategoryToChildren"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToChildren_B_index" ON "_CategoryToChildren"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToImage_AB_unique" ON "_CollectionToImage"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToImage_B_index" ON "_CollectionToImage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToProduct_AB_unique" ON "_CollectionToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToProduct_B_index" ON "_CollectionToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerToEmailedProducts_AB_unique" ON "_CustomerToEmailedProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerToEmailedProducts_B_index" ON "_CustomerToEmailedProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FitPicToProduct_AB_unique" ON "_FitPicToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_FitPicToProduct_B_index" ON "_FitPicToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ImageToProduct_AB_unique" ON "_ImageToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_ImageToProduct_B_index" ON "_ImageToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToOrderLineItem_AB_unique" ON "_OrderToOrderLineItem"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToOrderLineItem_B_index" ON "_OrderToOrderLineItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PackageToPhysicalProduct_AB_unique" ON "_PackageToPhysicalProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageToPhysicalProduct_B_index" ON "_PackageToPhysicalProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ReservationToAllProducts_AB_unique" ON "_ReservationToAllProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_ReservationToAllProducts_B_index" ON "_ReservationToAllProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ReservationToNewProducts_AB_unique" ON "_ReservationToNewProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_ReservationToNewProducts_B_index" ON "_ReservationToNewProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ReservationToReturnedProducts_AB_unique" ON "_ReservationToReturnedProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_ReservationToReturnedProducts_B_index" ON "_ReservationToReturnedProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductFunction_AB_unique" ON "_ProductToProductFunction"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductFunction_B_index" ON "_ProductToProductFunction"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToTag_AB_unique" ON "_ProductToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToTag_B_index" ON "_ProductToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantManufacturerSize_AB_unique" ON "_ProductVariantManufacturerSize"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantManufacturerSize_B_index" ON "_ProductVariantManufacturerSize"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToPushNotificationReceipts_AB_unique" ON "_UserToPushNotificationReceipts"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToPushNotificationReceipts_B_index" ON "_UserToPushNotificationReceipts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_WarehouseLocationToWarehouseLocationConstraint_AB_unique" ON "_WarehouseLocationToWarehouseLocationConstraint"("A", "B");

-- CreateIndex
CREATE INDEX "_WarehouseLocationToWarehouseLocationConstraint_B_index" ON "_WarehouseLocationToWarehouseLocationConstraint"("B");

-- AddForeignKey
ALTER TABLE "ActiveAdminUser" ADD FOREIGN KEY ("admin") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD FOREIGN KEY ("activeAdminUser") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLogInterpretation" ADD FOREIGN KEY ("log") REFERENCES "AdminActionLog"("actionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagItem" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagItem" ADD FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD FOREIGN KEY ("logoImage") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD FOREIGN KEY ("shopifyShop") REFERENCES "ShopifyShop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD FOREIGN KEY ("admissions") REFERENCES "CustomerAdmissionsData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD FOREIGN KEY ("billingInfo") REFERENCES "BillingInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD FOREIGN KEY ("detail") REFERENCES "CustomerDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD FOREIGN KEY ("referrer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD FOREIGN KEY ("utm") REFERENCES "UTMData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDetail" ADD FOREIGN KEY ("shippingAddress") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDetail" ADD FOREIGN KEY ("stylePreferences") REFERENCES "StylePreferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMembership" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMembership" ADD FOREIGN KEY ("plan") REFERENCES "PaymentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMembership" ADD FOREIGN KEY ("subscription") REFERENCES "CustomerMembershipSubscriptionData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNotificationBarReceipt" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailReceipt" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitPic" ADD FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitPic" ADD FOREIGN KEY ("location") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitPic" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitPicReport" ADD FOREIGN KEY ("reported") REFERENCES "FitPic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitPicReport" ADD FOREIGN KEY ("reporter") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Launch" ADD FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Launch" ADD FOREIGN KEY ("collection") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD FOREIGN KEY ("sentPackage") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD FOREIGN KEY ("reservation") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD FOREIGN KEY ("fromAddress") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD FOREIGN KEY ("shippingLabel") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD FOREIGN KEY ("toAddress") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageTransitEvent" ADD FOREIGN KEY ("package") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageTransitEvent" ADD FOREIGN KEY ("reservation") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PauseRequest" ADD FOREIGN KEY ("membership") REFERENCES "CustomerMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PauseRequest" ADD FOREIGN KEY ("reason") REFERENCES "PauseReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalProduct" ADD FOREIGN KEY ("location") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalProduct" ADD FOREIGN KEY ("price") REFERENCES "PhysicalProductPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalProduct" ADD FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalProduct" ADD FOREIGN KEY ("warehouseLocation") REFERENCES "WarehouseLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalProductQualityReport" ADD FOREIGN KEY ("physicalProduct") REFERENCES "PhysicalProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalProductQualityReport" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("color") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("materialCategory") REFERENCES "ProductMaterialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("model") REFERENCES "ProductModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("modelSize") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("season") REFERENCES "ProductSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("secondaryColor") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD FOREIGN KEY ("tier") REFERENCES "ProductTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMaterialCategory" ADD FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNotification" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNotification" ADD FOREIGN KEY ("physicalProduct") REFERENCES "PhysicalProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNotification" ADD FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSeason" ADD FOREIGN KEY ("internalSeason") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSeason" ADD FOREIGN KEY ("vendorSeason") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD FOREIGN KEY ("color") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD FOREIGN KEY ("internalSize") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD FOREIGN KEY ("price") REFERENCES "ProductVariantPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD FOREIGN KEY ("product") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantFeedback" ADD FOREIGN KEY ("reservationFeedback") REFERENCES "ReservationFeedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantFeedback" ADD FOREIGN KEY ("variant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantFeedbackQuestion" ADD FOREIGN KEY ("variantFeedback") REFERENCES "ProductVariantFeedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantWant" ADD FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantWant" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushNotificationReceipt" ADD FOREIGN KEY ("userPushNotification") REFERENCES "UserPushNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedProduct" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedProduct" ADD FOREIGN KEY ("product") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("lastLocation") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("receipt") REFERENCES "ReservationReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("returnedPackage") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("sentPackage") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("shippingOption") REFERENCES "ShippingOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationFeedback" ADD FOREIGN KEY ("reservation") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationFeedback" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationReceiptItem" ADD FOREIGN KEY ("product") REFERENCES "PhysicalProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationReceiptItem" ADD FOREIGN KEY ("receipt") REFERENCES "ReservationReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOption" ADD FOREIGN KEY ("destination") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOption" ADD FOREIGN KEY ("origin") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingOption" ADD FOREIGN KEY ("shippingMethod") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyProductVariant" ADD FOREIGN KEY ("brand") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyProductVariant" ADD FOREIGN KEY ("image") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyProductVariant" ADD FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyProductVariant" ADD FOREIGN KEY ("shop") REFERENCES "ShopifyShop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyProductVariantSelectedOption" ADD FOREIGN KEY ("shopifyProductVariant") REFERENCES "ShopifyProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size" ADD FOREIGN KEY ("accessory") REFERENCES "AccessorySize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size" ADD FOREIGN KEY ("bottom") REFERENCES "BottomSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size" ADD FOREIGN KEY ("top") REFERENCES "TopSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsReceipt" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncTiming" ADD FOREIGN KEY ("customer") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("deviceData") REFERENCES "UserDeviceData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("pushNotification") REFERENCES "UserPushNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPushNotificationInterest" ADD FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPushNotificationInterest" ADD FOREIGN KEY ("userPushNotification") REFERENCES "UserPushNotification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseLocationConstraint" ADD FOREIGN KEY ("category") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToBrandImages" ADD FOREIGN KEY ("A") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToBrandImages" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToChildren" ADD FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToChildren" ADD FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToImage" ADD FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToImage" ADD FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProduct" ADD FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProduct" ADD FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerToEmailedProducts" ADD FOREIGN KEY ("A") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerToEmailedProducts" ADD FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FitPicToProduct" ADD FOREIGN KEY ("A") REFERENCES "FitPic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FitPicToProduct" ADD FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToProduct" ADD FOREIGN KEY ("A") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageToProduct" ADD FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderLineItem" ADD FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderLineItem" ADD FOREIGN KEY ("B") REFERENCES "OrderLineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToPhysicalProduct" ADD FOREIGN KEY ("A") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageToPhysicalProduct" ADD FOREIGN KEY ("B") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationToAllProducts" ADD FOREIGN KEY ("A") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationToAllProducts" ADD FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationToNewProducts" ADD FOREIGN KEY ("A") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationToNewProducts" ADD FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationToReturnedProducts" ADD FOREIGN KEY ("A") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReservationToReturnedProducts" ADD FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductFunction" ADD FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductFunction" ADD FOREIGN KEY ("B") REFERENCES "ProductFunction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToTag" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariantManufacturerSize" ADD FOREIGN KEY ("A") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariantManufacturerSize" ADD FOREIGN KEY ("B") REFERENCES "Size"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToPushNotificationReceipts" ADD FOREIGN KEY ("A") REFERENCES "PushNotificationReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToPushNotificationReceipts" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WarehouseLocationToWarehouseLocationConstraint" ADD FOREIGN KEY ("A") REFERENCES "WarehouseLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WarehouseLocationToWarehouseLocationConstraint" ADD FOREIGN KEY ("B") REFERENCES "WarehouseLocationConstraint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
