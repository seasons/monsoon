CREATE TYPE "ProductTierName" AS ENUM ('Standard', 'Luxury');
ALTER TABLE monsoon$dev."ProductTier" ALTER COLUMN "tier" TYPE "ProductTierName" USING "tier"::text::"ProductTierName";


CREATE TYPE "BrandTier" AS ENUM ('Tier0', 'Tier1', 'Tier2', 'Niche', 'Upcoming', 'Retro', 'Boutique', 'Local', 'Discovery');
ALTER TABLE monsoon$dev."Brand" ALTER COLUMN "tier" TYPE "BrandTier" USING "tier"::text::"BrandTier";


CREATE TYPE "Department" AS ENUM ('Clothes', 'Bags', 'Accessories', 'Jewelry');


CREATE TYPE "LocationType" AS ENUM ('Office', 'Warehouse', 'Cleaner', 'Customer');
ALTER TABLE monsoon$dev."Location" ALTER COLUMN "locationType" TYPE "LocationType" USING "locationType"::text::"LocationType";


CREATE TYPE "MeasurementType" AS ENUM ('Inches', 'Millimeters');
ALTER TABLE monsoon$dev."Category" ALTER COLUMN "measurementType" TYPE "MeasurementType" USING "measurementType"::text::"MeasurementType";


CREATE TYPE "CustomerStatus" AS ENUM ('Invited', 'Created', 'Waitlisted', 'Authorized', 'Active', 'Suspended', 'PaymentFailed', 'Paused', 'Deactivated');
ALTER TABLE monsoon$dev."Customer" ALTER COLUMN "status" TYPE "CustomerStatus" USING "status"::text::"CustomerStatus";


CREATE TYPE "UserRole" AS ENUM ('Admin', 'Customer', 'Partner', 'Marketer');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::text::"UserRole";
ALTER TABLE monsoon$dev."User" ALTER COLUMN "roles" TYPE "UserRole"[] USING "roles"::text[]::"UserRole"[];


CREATE TYPE "InventoryStatus" AS ENUM ('NonReservable', 'Reservable', 'Reserved', 'Stored', 'Offloaded');
ALTER TABLE monsoon$dev."PhysicalProduct" ALTER COLUMN "inventoryStatus" TYPE "InventoryStatus" USING "inventoryStatus"::text::"InventoryStatus";


CREATE TYPE "PhysicalProductStatus" AS ENUM ('New', 'Used', 'Dirty', 'Damaged', 'PermanentlyDamaged', 'Clean', 'Lost', 'Sold');
ALTER TABLE monsoon$dev."PhysicalProduct" ALTER COLUMN "productStatus" TYPE "PhysicalProductStatus" USING "productStatus"::text::"PhysicalProductStatus";
ALTER TABLE monsoon$dev."ReservationReceiptItem" ALTER COLUMN "productStatus" TYPE "PhysicalProductStatus" USING "productStatus"::text::"PhysicalProductStatus";


CREATE TYPE "PhysicalProductOffloadMethod" AS ENUM ('SoldToUser', 'SoldToThirdParty', 'ReturnedToVendor', 'Recycled', 'Unknown');
ALTER TABLE monsoon$dev."PhysicalProduct" ALTER COLUMN "offloadMethod" TYPE "PhysicalProductOffloadMethod" USING "offloadMethod"::text::"PhysicalProductOffloadMethod";


CREATE TYPE "ProductStatus" AS ENUM ('Available', 'NotAvailable', 'Stored', 'Offloaded');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "status" TYPE "ProductStatus" USING "status"::text::"ProductStatus";


CREATE TYPE "PackageStatus" AS ENUM ('Queued', 'Shipped', 'Delivered', 'Blocked', 'Received', 'Cancelled');
ALTER TABLE monsoon$dev."Package" ALTER COLUMN "status" TYPE "PackageStatus" USING "status"::text::"PackageStatus";


CREATE TYPE "ReservationStatus" AS ENUM ('Queued', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Hold', 'Blocked', 'Unknown', 'Lost', 'Received');
ALTER TABLE monsoon$dev."Reservation" ALTER COLUMN "status" TYPE "ReservationStatus" USING "status"::text::"ReservationStatus";


CREATE TYPE "BagItemStatus" AS ENUM ('Added', 'Reserved', 'Received');
ALTER TABLE monsoon$dev."BagItem" ALTER COLUMN "status" TYPE "BagItemStatus" USING "status"::text::"BagItemStatus";


CREATE TYPE "Plan" AS ENUM ('AllAccess', 'Essential');
ALTER TABLE monsoon$dev."Customer" ALTER COLUMN "plan" TYPE "Plan" USING "plan"::text::"Plan";


CREATE TYPE "ProductType" AS ENUM ('Top', 'Bottom', 'Accessory', 'Shoe');
ALTER TABLE monsoon$dev."Category" ALTER COLUMN "productType" TYPE "ProductType" USING "productType"::text::"ProductType";
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "type" TYPE "ProductType" USING "type"::text::"ProductType";
ALTER TABLE monsoon$dev."Size" ALTER COLUMN "productType" TYPE "ProductType" USING "productType"::text::"ProductType";


CREATE TYPE "BottomSizeType" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter');
ALTER TABLE monsoon$dev."BottomSize" ALTER COLUMN "type" TYPE "BottomSizeType" USING "type"::text::"BottomSizeType";


CREATE TYPE "SizeType" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter', 'Universal');
ALTER TABLE monsoon$dev."Size" ALTER COLUMN "type" TYPE "SizeType" USING "type"::text::"SizeType";


CREATE TYPE "QuestionType" AS ENUM ('MultipleChoice', 'FreeResponse');
ALTER TABLE monsoon$dev."ProductVariantFeedbackQuestion" ALTER COLUMN "type" TYPE "QuestionType" USING "type"::text::"QuestionType";


CREATE TYPE "Rating" AS ENUM ('Disliked', 'Ok', 'Loved');
ALTER TABLE monsoon$dev."ReservationFeedback" ALTER COLUMN "rating" TYPE "Rating" USING "rating"::text::"Rating";


CREATE TYPE "LetterSize" AS ENUM ('XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');
ALTER TABLE monsoon$dev."TopSize" ALTER COLUMN "letter" TYPE "LetterSize" USING "letter"::text::"LetterSize";


CREATE TYPE "ProductArchitecture" AS ENUM ('Fashion', 'Showstopper', 'Staple');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "architecture" TYPE "ProductArchitecture" USING "architecture"::text::"ProductArchitecture";


CREATE TYPE "WarehouseLocationType" AS ENUM ('Conveyor', 'Rail', 'Bin');
ALTER TABLE monsoon$dev."WarehouseLocation" ALTER COLUMN "type" TYPE "WarehouseLocationType" USING "type"::text::"WarehouseLocationType";


CREATE TYPE "PhotographyStatus" AS ENUM ('Done', 'InProgress', 'ReadyForEditing', 'ReadyToShoot', 'Steam');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "photographyStatus" TYPE "PhotographyStatus" USING "photographyStatus"::text::"PhotographyStatus";


CREATE TYPE "EmailId" AS ENUM ('CompleteAccount', 'BuyUsedOrderConfirmation', 'DaySevenAuthorizationFollowup', 'DaySixAuthorizationFollowup', 'DayFiveAuthorizationFollowup', 'DayFourAuthorizationFollowup', 'DayThreeAuthorizationFollowup', 'DayTwoAuthorizationFollowup', 'FreeToReserve', 'Paused', 'PriorityAccess', 'ReferralConfirmation', 'ReservationConfirmation', 'ReservationReturnConfirmation', 'ResumeConfirmation', 'ResumeReminder', 'ReturnReminder', 'Rewaitlisted', 'SubmittedEmail', 'TwentyFourHourAuthorizationFollowup', 'Waitlisted', 'WelcomeToSeasons', 'UnpaidMembership', 'ReturnToGoodStanding', 'RecommendedItemsNurture');
ALTER TABLE monsoon$dev."EmailReceipt" ALTER COLUMN "emailId" TYPE "EmailId" USING "emailId"::text::"EmailId";


CREATE TYPE "PackageTransitEventStatus" AS ENUM ('Delivered', 'Failure', 'PreTransit', 'Returned', 'Transit', 'Unknown');
ALTER TABLE monsoon$dev."PackageTransitEvent" ALTER COLUMN "status" TYPE "PackageTransitEventStatus" USING "status"::text::"PackageTransitEventStatus";


CREATE TYPE "PackageTransitEventSubStatus" AS ENUM ('AddressIssue', 'ContactCarrier', 'Delayed', 'Delivered', 'DeliveryAttempted', 'DeliveryRescheduled', 'DeliveryScheduled', 'InformationReceived', 'LocationInaccessible', 'NoticeLeft', 'Other', 'OutForDelivery', 'PackageAccepted', 'PackageArrived', 'PackageDamaged', 'PackageDeparted', 'PackageDisposed', 'PackageForwarded', 'PackageHeld', 'PackageLost', 'PackageProcessed', 'PackageProcessing', 'PackageUnclaimed', 'PackageUndeliverable', 'PickupAvailable', 'RescheduleDelivery', 'ReturnToSender');
ALTER TABLE monsoon$dev."PackageTransitEvent" ALTER COLUMN "subStatus" TYPE "PackageTransitEventSubStatus" USING "subStatus"::text::"PackageTransitEventSubStatus";


CREATE TYPE "ReservationPhase" AS ENUM ('BusinessToCustomer', 'CustomerToBusiness');
ALTER TABLE monsoon$dev."Reservation" ALTER COLUMN "phase" TYPE "ReservationPhase" USING "phase"::text::"ReservationPhase";


CREATE TYPE "UserPushNotificationInterestType" AS ENUM ('Bag', 'Blog', 'Brand', 'General', 'NewProduct');
ALTER TABLE monsoon$dev."UserPushNotificationInterest" ALTER COLUMN "type" TYPE "UserPushNotificationInterestType" USING "type"::text::"UserPushNotificationInterestType";


CREATE TYPE "InAdmissableReason" AS ENUM ('Untriageable', 'UnsupportedPlatform', 'AutomaticAdmissionsFlagOff', 'UnserviceableZipcode', 'InsufficientInventory', 'OpsThresholdExceeded');
ALTER TABLE monsoon$dev."CustomerAdmissionsData" ALTER COLUMN "inAdmissableReason" TYPE "InAdmissableReason" USING "inAdmissableReason"::text::"InAdmissableReason";


CREATE TYPE "ShippingCode" AS ENUM ('UPSGround', 'UPSSelect');
ALTER TABLE monsoon$dev."ShippingMethod" ALTER COLUMN "code" TYPE "ShippingCode" USING "code"::text::"ShippingCode";


CREATE TYPE "CollectionPlacement" AS ENUM ('Homepage');
ALTER TABLE monsoon$dev."Collection" ALTER COLUMN "placements" TYPE "CollectionPlacement"[] USING "placements"::text[]::"CollectionPlacement"[];


CREATE TYPE "PhysicalProductDamageType" AS ENUM ('BarcodeMissing', 'ButtonMissing', 'Stain', 'Smell', 'Tear', 'Other');
ALTER TABLE monsoon$dev."PhysicalProductQualityReport" ALTER COLUMN "damageType" TYPE "PhysicalProductDamageType" USING "damageType"::text::"PhysicalProductDamageType";
ALTER TABLE monsoon$dev."PhysicalProductQualityReport" ALTER COLUMN "damageTypes" TYPE "PhysicalProductDamageType"[] USING "damageTypes"::text[]::"PhysicalProductDamageType"[];


CREATE TYPE "ProductFit" AS ENUM ('RunsBig', 'TrueToSize', 'RunsSmall');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "productFit" TYPE "ProductFit" USING "productFit"::text::"ProductFit";


CREATE TYPE "ProductNotificationType" AS ENUM ('Restock', 'AvailableForPurchase');
ALTER TABLE monsoon$dev."ProductNotification" ALTER COLUMN "type" TYPE "ProductNotificationType" USING "type"::text::"ProductNotificationType";


CREATE TYPE "PaymentPlanTier" AS ENUM ('Essential', 'AllAccess', 'Pause');
ALTER TABLE monsoon$dev."PaymentPlan" ALTER COLUMN "tier" TYPE "PaymentPlanTier" USING "tier"::text::"PaymentPlanTier";


CREATE TYPE "SmsStatus" AS ENUM ('Queued', 'Sending', 'Sent', 'Failed', 'Delivered', 'Undelivered', 'Receiving', 'Received', 'Accepted', 'Scheduled', 'Read', 'PartiallyDelivered');
ALTER TABLE monsoon$dev."SmsReceipt" ALTER COLUMN "status" TYPE "SmsStatus" USING "status"::text::"SmsStatus";


CREATE TYPE "SeasonCode" AS ENUM ('FW', 'SS', 'PS', 'PF', 'HO', 'AW');
ALTER TABLE monsoon$dev."Season" ALTER COLUMN "seasonCode" TYPE "SeasonCode" USING "seasonCode"::text::"SeasonCode";


CREATE TYPE "SeasonString" AS ENUM ('Spring', 'Summer', 'Winter', 'Fall');
ALTER TABLE monsoon$dev."ProductSeason" ALTER COLUMN "wearableSeasons" TYPE "SeasonString"[] USING "wearableSeasons"::text[]::"SeasonString"[];


CREATE TYPE "UserVerificationMethod" AS ENUM ('SMS', 'Email', 'None');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "verificationMethod" TYPE "UserVerificationMethod" USING "verificationMethod"::text::"UserVerificationMethod";


CREATE TYPE "UserVerificationStatus" AS ENUM ('Approved', 'Denied', 'Pending');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "verificationStatus" TYPE "UserVerificationStatus" USING "verificationStatus"::text::"UserVerificationStatus";


CREATE TYPE "PushNotificationStatus" AS ENUM ('Blocked', 'Granted', 'Denied');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "pushNotificationStatus" TYPE "PushNotificationStatus" USING "pushNotificationStatus"::text::"PushNotificationStatus";


CREATE TYPE "FitPicStatus" AS ENUM ('Submitted', 'Published', 'Unpublished');
ALTER TABLE monsoon$dev."FitPic" ALTER COLUMN "status" TYPE "FitPicStatus" USING "status"::text::"FitPicStatus";


CREATE TYPE "FitPicReportStatus" AS ENUM ('Pending', 'Reviewed');
ALTER TABLE monsoon$dev."FitPicReport" ALTER COLUMN "status" TYPE "FitPicReportStatus" USING "status"::text::"FitPicReportStatus";


CREATE TYPE "CustomerStyle" AS ENUM ('AvantGarde', 'Bold', 'Classic', 'Minimalist', 'Streetwear', 'Techwear');
ALTER TABLE monsoon$dev."Brand" ALTER COLUMN "styles" TYPE "CustomerStyle"[] USING "styles"::text[]::"CustomerStyle"[];
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "styles" TYPE "CustomerStyle"[] USING "styles"::text[]::"CustomerStyle"[];
ALTER TABLE monsoon$dev."CustomerDetail" ALTER COLUMN "styles" TYPE "CustomerStyle"[] USING "styles"::text[]::"CustomerStyle"[];


CREATE TYPE "NotificationBarID" AS ENUM ('PastDueInvoice', 'TestDismissable', 'AuthorizedReminder');
ALTER TABLE monsoon$dev."CustomerNotificationBarReceipt" ALTER COLUMN "notificationBarId" TYPE "NotificationBarID" USING "notificationBarId"::text::"NotificationBarID";


CREATE TYPE "PauseType" AS ENUM ('WithItems', 'WithoutItems');
ALTER TABLE monsoon$dev."PauseRequest" ALTER COLUMN "pauseType" TYPE "PauseType" USING "pauseType"::text::"PauseType";


CREATE TYPE "OrderType" AS ENUM ('Used', 'New');
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "type" TYPE "OrderType" USING "type"::text::"OrderType";


CREATE TYPE "OrderLineItemRecordType" AS ENUM ('PhysicalProduct', 'ProductVariant', 'ExternalProduct', 'Package', 'EarlySwap', 'Reservation');
ALTER TABLE monsoon$dev."OrderLineItem" ALTER COLUMN "recordType" TYPE "OrderLineItemRecordType" USING "recordType"::text::"OrderLineItemRecordType";


CREATE TYPE "OrderStatus" AS ENUM ('Drafted', 'Submitted', 'Fulfilled', 'Returned', 'Cancelled');
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::text::"OrderStatus";


CREATE TYPE "OrderCancelReason" AS ENUM ('Customer', 'Declined', 'Fraud', 'Inventory', 'Other');
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "cancelReason" TYPE "OrderCancelReason" USING "cancelReason"::text::"OrderCancelReason";


CREATE TYPE "OrderPaymentStatus" AS ENUM ('Paid', 'PartiallyPaid', 'Refunded', 'NotPaid', 'Complete');

UPDATE monsoon$dev."Order"
SET "paymentStatus" = 'Complete'
WHERE  monsoon$dev."Order"."paymentStatus" = 'complete'
      
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "paymentStatus" TYPE "OrderPaymentStatus" USING "paymentStatus"::text::"OrderPaymentStatus";


CREATE TYPE "AdminAction" AS ENUM ('Insert', 'Delete', 'Update', 'Truncate');
ALTER TABLE monsoon$dev."AdminActionLog" ALTER COLUMN "action" TYPE "AdminAction" USING "action"::text::"AdminAction";


CREATE TYPE "SyncTimingType" AS ENUM ('Drip', 'Next', 'Impact');
ALTER TABLE monsoon$dev."SyncTiming" ALTER COLUMN "type" TYPE "SyncTimingType" USING "type"::text::"SyncTimingType";


