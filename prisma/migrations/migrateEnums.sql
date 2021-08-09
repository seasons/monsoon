CREATE TYPE monsoon$dev."ProductTierName" AS ENUM ('Standard', 'Luxury');
ALTER TABLE monsoon$dev."ProductTier" ALTER COLUMN "tier" TYPE monsoon$dev."ProductTierName" USING "tier"::text::monsoon$dev."ProductTierName";


CREATE TYPE monsoon$dev."BrandTier" AS ENUM ('Tier0', 'Tier1', 'Tier2', 'Niche', 'Upcoming', 'Retro', 'Boutique', 'Local', 'Discovery');
ALTER TABLE monsoon$dev."Brand" ALTER COLUMN "tier" TYPE monsoon$dev."BrandTier" USING "tier"::text::monsoon$dev."BrandTier";


CREATE TYPE monsoon$dev."Department" AS ENUM ('Clothes', 'Bags', 'Accessories', 'Jewelry');


CREATE TYPE monsoon$dev."LocationType" AS ENUM ('Office', 'Warehouse', 'Cleaner', 'Customer');
ALTER TABLE monsoon$dev."Location" ALTER COLUMN "locationType" TYPE monsoon$dev."LocationType" USING "locationType"::text::monsoon$dev."LocationType";


CREATE TYPE monsoon$dev."MeasurementType" AS ENUM ('Inches', 'Millimeters');
ALTER TABLE monsoon$dev."Category" ALTER COLUMN "measurementType" TYPE monsoon$dev."MeasurementType" USING "measurementType"::text::monsoon$dev."MeasurementType";


CREATE TYPE monsoon$dev."CustomerStatus" AS ENUM ('Invited', 'Created', 'Waitlisted', 'Authorized', 'Active', 'Suspended', 'PaymentFailed', 'Paused', 'Deactivated');
ALTER TABLE monsoon$dev."Customer" ALTER COLUMN "status" TYPE monsoon$dev."CustomerStatus" USING "status"::text::monsoon$dev."CustomerStatus";


CREATE TYPE monsoon$dev."UserRole" AS ENUM ('Admin', 'Customer', 'Partner', 'Marketer');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "role" TYPE monsoon$dev."UserRole" USING "role"::text::monsoon$dev."UserRole";
ALTER TABLE monsoon$dev."User" ALTER COLUMN "roles" TYPE monsoon$dev."UserRole"[] USING "roles"::text[]::monsoon$dev."UserRole"[];


CREATE TYPE monsoon$dev."InventoryStatus" AS ENUM ('NonReservable', 'Reservable', 'Reserved', 'Stored', 'Offloaded');
ALTER TABLE monsoon$dev."PhysicalProduct" ALTER COLUMN "inventoryStatus" TYPE monsoon$dev."InventoryStatus" USING "inventoryStatus"::text::monsoon$dev."InventoryStatus";


CREATE TYPE monsoon$dev."PhysicalProductStatus" AS ENUM ('New', 'Used', 'Dirty', 'Damaged', 'PermanentlyDamaged', 'Clean', 'Lost', 'Sold');
ALTER TABLE monsoon$dev."PhysicalProduct" ALTER COLUMN "productStatus" TYPE monsoon$dev."PhysicalProductStatus" USING "productStatus"::text::monsoon$dev."PhysicalProductStatus";
ALTER TABLE monsoon$dev."ReservationReceiptItem" ALTER COLUMN "productStatus" TYPE monsoon$dev."PhysicalProductStatus" USING "productStatus"::text::monsoon$dev."PhysicalProductStatus";


CREATE TYPE monsoon$dev."PhysicalProductOffloadMethod" AS ENUM ('SoldToUser', 'SoldToThirdParty', 'ReturnedToVendor', 'Recycled', 'Unknown');
ALTER TABLE monsoon$dev."PhysicalProduct" ALTER COLUMN "offloadMethod" TYPE monsoon$dev."PhysicalProductOffloadMethod" USING "offloadMethod"::text::monsoon$dev."PhysicalProductOffloadMethod";


CREATE TYPE monsoon$dev."ProductStatus" AS ENUM ('Available', 'NotAvailable', 'Stored', 'Offloaded');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "status" TYPE monsoon$dev."ProductStatus" USING "status"::text::monsoon$dev."ProductStatus";


CREATE TYPE monsoon$dev."PackageStatus" AS ENUM ('Queued', 'Shipped', 'Delivered', 'Blocked', 'Received', 'Cancelled');
ALTER TABLE monsoon$dev."Package" ALTER COLUMN "status" TYPE monsoon$dev."PackageStatus" USING "status"::text::monsoon$dev."PackageStatus";


CREATE TYPE monsoon$dev."ReservationStatus" AS ENUM ('Queued', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Hold', 'Blocked', 'Unknown', 'Lost', 'Received');
ALTER TABLE monsoon$dev."Reservation" ALTER COLUMN "status" TYPE monsoon$dev."ReservationStatus" USING "status"::text::monsoon$dev."ReservationStatus";


CREATE TYPE monsoon$dev."BagItemStatus" AS ENUM ('Added', 'Reserved', 'Received');
ALTER TABLE monsoon$dev."BagItem" ALTER COLUMN "status" TYPE monsoon$dev."BagItemStatus" USING "status"::text::monsoon$dev."BagItemStatus";


CREATE TYPE monsoon$dev."Plan" AS ENUM ('AllAccess', 'Essential');
ALTER TABLE monsoon$dev."Customer" ALTER COLUMN "plan" TYPE monsoon$dev."Plan" USING "plan"::text::monsoon$dev."Plan";


CREATE TYPE monsoon$dev."ProductType" AS ENUM ('Top', 'Bottom', 'Accessory', 'Shoe');
ALTER TABLE monsoon$dev."Category" ALTER COLUMN "productType" TYPE monsoon$dev."ProductType" USING "productType"::text::monsoon$dev."ProductType";
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "type" TYPE monsoon$dev."ProductType" USING "type"::text::monsoon$dev."ProductType";
ALTER TABLE monsoon$dev."Size" ALTER COLUMN "productType" TYPE monsoon$dev."ProductType" USING "productType"::text::monsoon$dev."ProductType";


CREATE TYPE monsoon$dev."BottomSizeType" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter');
ALTER TABLE monsoon$dev."BottomSize" ALTER COLUMN "type" TYPE monsoon$dev."BottomSizeType" USING "type"::text::monsoon$dev."BottomSizeType";


CREATE TYPE monsoon$dev."SizeType" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter', 'Universal');
ALTER TABLE monsoon$dev."Size" ALTER COLUMN "type" TYPE monsoon$dev."SizeType" USING "type"::text::monsoon$dev."SizeType";


CREATE TYPE monsoon$dev."QuestionType" AS ENUM ('MultipleChoice', 'FreeResponse');
ALTER TABLE monsoon$dev."ProductVariantFeedbackQuestion" ALTER COLUMN "type" TYPE monsoon$dev."QuestionType" USING "type"::text::monsoon$dev."QuestionType";


CREATE TYPE monsoon$dev."Rating" AS ENUM ('Disliked', 'Ok', 'Loved');
ALTER TABLE monsoon$dev."ReservationFeedback" ALTER COLUMN "rating" TYPE monsoon$dev."Rating" USING "rating"::text::monsoon$dev."Rating";


CREATE TYPE monsoon$dev."LetterSize" AS ENUM ('XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');
ALTER TABLE monsoon$dev."TopSize" ALTER COLUMN "letter" TYPE monsoon$dev."LetterSize" USING "letter"::text::monsoon$dev."LetterSize";


CREATE TYPE monsoon$dev."ProductArchitecture" AS ENUM ('Fashion', 'Showstopper', 'Staple');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "architecture" TYPE monsoon$dev."ProductArchitecture" USING "architecture"::text::monsoon$dev."ProductArchitecture";


CREATE TYPE monsoon$dev."WarehouseLocationType" AS ENUM ('Conveyor', 'Rail', 'Bin');
ALTER TABLE monsoon$dev."WarehouseLocation" ALTER COLUMN "type" TYPE monsoon$dev."WarehouseLocationType" USING "type"::text::monsoon$dev."WarehouseLocationType";


CREATE TYPE monsoon$dev."PhotographyStatus" AS ENUM ('Done', 'InProgress', 'ReadyForEditing', 'ReadyToShoot', 'Steam');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "photographyStatus" TYPE monsoon$dev."PhotographyStatus" USING "photographyStatus"::text::monsoon$dev."PhotographyStatus";


CREATE TYPE monsoon$dev."EmailId" AS ENUM ('CompleteAccount', 'BuyUsedOrderConfirmation', 'DaySevenAuthorizationFollowup', 'DaySixAuthorizationFollowup', 'DayFiveAuthorizationFollowup', 'DayFourAuthorizationFollowup', 'DayThreeAuthorizationFollowup', 'DayTwoAuthorizationFollowup', 'FreeToReserve', 'Paused', 'PriorityAccess', 'ReferralConfirmation', 'ReservationConfirmation', 'ReservationReturnConfirmation', 'ResumeConfirmation', 'ResumeReminder', 'ReturnReminder', 'Rewaitlisted', 'SubmittedEmail', 'TwentyFourHourAuthorizationFollowup', 'Waitlisted', 'WelcomeToSeasons', 'UnpaidMembership', 'ReturnToGoodStanding', 'RecommendedItemsNurture');
ALTER TABLE monsoon$dev."EmailReceipt" ALTER COLUMN "emailId" TYPE monsoon$dev."EmailId" USING "emailId"::text::monsoon$dev."EmailId";


CREATE TYPE monsoon$dev."PackageTransitEventStatus" AS ENUM ('Delivered', 'Failure', 'PreTransit', 'Returned', 'Transit', 'Unknown');
ALTER TABLE monsoon$dev."PackageTransitEvent" ALTER COLUMN "status" TYPE monsoon$dev."PackageTransitEventStatus" USING "status"::text::monsoon$dev."PackageTransitEventStatus";


CREATE TYPE monsoon$dev."PackageTransitEventSubStatus" AS ENUM ('AddressIssue', 'ContactCarrier', 'Delayed', 'Delivered', 'DeliveryAttempted', 'DeliveryRescheduled', 'DeliveryScheduled', 'InformationReceived', 'LocationInaccessible', 'NoticeLeft', 'Other', 'OutForDelivery', 'PackageAccepted', 'PackageArrived', 'PackageDamaged', 'PackageDeparted', 'PackageDisposed', 'PackageForwarded', 'PackageHeld', 'PackageLost', 'PackageProcessed', 'PackageProcessing', 'PackageUnclaimed', 'PackageUndeliverable', 'PickupAvailable', 'RescheduleDelivery', 'ReturnToSender');
ALTER TABLE monsoon$dev."PackageTransitEvent" ALTER COLUMN "subStatus" TYPE monsoon$dev."PackageTransitEventSubStatus" USING "subStatus"::text::monsoon$dev."PackageTransitEventSubStatus";


CREATE TYPE monsoon$dev."ReservationPhase" AS ENUM ('BusinessToCustomer', 'CustomerToBusiness');
ALTER TABLE monsoon$dev."Reservation" ALTER COLUMN "phase" TYPE monsoon$dev."ReservationPhase" USING "phase"::text::monsoon$dev."ReservationPhase";


CREATE TYPE monsoon$dev."UserPushNotificationInterestType" AS ENUM ('Bag', 'Blog', 'Brand', 'General', 'NewProduct');
ALTER TABLE monsoon$dev."UserPushNotificationInterest" ALTER COLUMN "type" TYPE monsoon$dev."UserPushNotificationInterestType" USING "type"::text::monsoon$dev."UserPushNotificationInterestType";


CREATE TYPE monsoon$dev."InAdmissableReason" AS ENUM ('Untriageable', 'UnsupportedPlatform', 'AutomaticAdmissionsFlagOff', 'UnserviceableZipcode', 'InsufficientInventory', 'OpsThresholdExceeded');
ALTER TABLE monsoon$dev."CustomerAdmissionsData" ALTER COLUMN "inAdmissableReason" TYPE monsoon$dev."InAdmissableReason" USING "inAdmissableReason"::text::monsoon$dev."InAdmissableReason";


CREATE TYPE monsoon$dev."ShippingCode" AS ENUM ('UPSGround', 'UPSSelect');
ALTER TABLE monsoon$dev."ShippingMethod" ALTER COLUMN "code" TYPE monsoon$dev."ShippingCode" USING "code"::text::monsoon$dev."ShippingCode";


CREATE TYPE monsoon$dev."CollectionPlacement" AS ENUM ('Homepage');
ALTER TABLE monsoon$dev."Collection" ALTER COLUMN "placements" TYPE monsoon$dev."CollectionPlacement"[] USING "placements"::text[]::monsoon$dev."CollectionPlacement"[];


CREATE TYPE monsoon$dev."PhysicalProductDamageType" AS ENUM ('BarcodeMissing', 'ButtonMissing', 'Stain', 'Smell', 'Tear', 'Other');
ALTER TABLE monsoon$dev."PhysicalProductQualityReport" ALTER COLUMN "damageType" TYPE monsoon$dev."PhysicalProductDamageType" USING "damageType"::text::monsoon$dev."PhysicalProductDamageType";
ALTER TABLE monsoon$dev."PhysicalProductQualityReport" ALTER COLUMN "damageTypes" TYPE monsoon$dev."PhysicalProductDamageType"[] USING "damageTypes"::text[]::monsoon$dev."PhysicalProductDamageType"[];


CREATE TYPE monsoon$dev."ProductFit" AS ENUM ('RunsBig', 'TrueToSize', 'RunsSmall');
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "productFit" TYPE monsoon$dev."ProductFit" USING "productFit"::text::monsoon$dev."ProductFit";


CREATE TYPE monsoon$dev."ProductNotificationType" AS ENUM ('Restock', 'AvailableForPurchase');
ALTER TABLE monsoon$dev."ProductNotification" ALTER COLUMN "type" TYPE monsoon$dev."ProductNotificationType" USING "type"::text::monsoon$dev."ProductNotificationType";


CREATE TYPE monsoon$dev."PaymentPlanTier" AS ENUM ('Essential', 'AllAccess', 'Pause');
ALTER TABLE monsoon$dev."PaymentPlan" ALTER COLUMN "tier" TYPE monsoon$dev."PaymentPlanTier" USING "tier"::text::monsoon$dev."PaymentPlanTier";


CREATE TYPE monsoon$dev."SmsStatus" AS ENUM ('Queued', 'Sending', 'Sent', 'Failed', 'Delivered', 'Undelivered', 'Receiving', 'Received', 'Accepted', 'Scheduled', 'Read', 'PartiallyDelivered');
ALTER TABLE monsoon$dev."SmsReceipt" ALTER COLUMN "status" TYPE monsoon$dev."SmsStatus" USING "status"::text::monsoon$dev."SmsStatus";


CREATE TYPE monsoon$dev."SeasonCode" AS ENUM ('FW', 'SS', 'PS', 'PF', 'HO', 'AW');
ALTER TABLE monsoon$dev."Season" ALTER COLUMN "seasonCode" TYPE monsoon$dev."SeasonCode" USING "seasonCode"::text::monsoon$dev."SeasonCode";


CREATE TYPE monsoon$dev."SeasonString" AS ENUM ('Spring', 'Summer', 'Winter', 'Fall');
ALTER TABLE monsoon$dev."ProductSeason" ALTER COLUMN "wearableSeasons" TYPE monsoon$dev."SeasonString"[] USING "wearableSeasons"::text[]::monsoon$dev."SeasonString"[];


CREATE TYPE monsoon$dev."UserVerificationMethod" AS ENUM ('SMS', 'Email', 'None');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "verificationMethod" TYPE monsoon$dev."UserVerificationMethod" USING "verificationMethod"::text::monsoon$dev."UserVerificationMethod";


CREATE TYPE monsoon$dev."UserVerificationStatus" AS ENUM ('Approved', 'Denied', 'Pending');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "verificationStatus" TYPE monsoon$dev."UserVerificationStatus" USING "verificationStatus"::text::monsoon$dev."UserVerificationStatus";


CREATE TYPE monsoon$dev."PushNotificationStatus" AS ENUM ('Blocked', 'Granted', 'Denied');
ALTER TABLE monsoon$dev."User" ALTER COLUMN "pushNotificationStatus" TYPE monsoon$dev."PushNotificationStatus" USING "pushNotificationStatus"::text::monsoon$dev."PushNotificationStatus";


CREATE TYPE monsoon$dev."FitPicStatus" AS ENUM ('Submitted', 'Published', 'Unpublished');
ALTER TABLE monsoon$dev."FitPic" ALTER COLUMN "status" TYPE monsoon$dev."FitPicStatus" USING "status"::text::monsoon$dev."FitPicStatus";


CREATE TYPE monsoon$dev."FitPicReportStatus" AS ENUM ('Pending', 'Reviewed');
ALTER TABLE monsoon$dev."FitPicReport" ALTER COLUMN "status" TYPE monsoon$dev."FitPicReportStatus" USING "status"::text::monsoon$dev."FitPicReportStatus";


CREATE TYPE monsoon$dev."CustomerStyle" AS ENUM ('AvantGarde', 'Bold', 'Classic', 'Minimalist', 'Streetwear', 'Techwear');
ALTER TABLE monsoon$dev."Brand" ALTER COLUMN "styles" TYPE monsoon$dev."CustomerStyle"[] USING "styles"::text[]::monsoon$dev."CustomerStyle"[];
ALTER TABLE monsoon$dev."Product" ALTER COLUMN "styles" TYPE monsoon$dev."CustomerStyle"[] USING "styles"::text[]::monsoon$dev."CustomerStyle"[];
ALTER TABLE monsoon$dev."CustomerDetail" ALTER COLUMN "styles" TYPE monsoon$dev."CustomerStyle"[] USING "styles"::text[]::monsoon$dev."CustomerStyle"[];


CREATE TYPE monsoon$dev."NotificationBarID" AS ENUM ('PastDueInvoice', 'TestDismissable', 'AuthorizedReminder');
ALTER TABLE monsoon$dev."CustomerNotificationBarReceipt" ALTER COLUMN "notificationBarId" TYPE monsoon$dev."NotificationBarID" USING "notificationBarId"::text::monsoon$dev."NotificationBarID";


CREATE TYPE monsoon$dev."PauseType" AS ENUM ('WithItems', 'WithoutItems');
ALTER TABLE monsoon$dev."PauseRequest" ALTER COLUMN "pauseType" TYPE monsoon$dev."PauseType" USING "pauseType"::text::monsoon$dev."PauseType";


CREATE TYPE monsoon$dev."OrderType" AS ENUM ('Used', 'New');
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "type" TYPE monsoon$dev."OrderType" USING "type"::text::monsoon$dev."OrderType";


CREATE TYPE monsoon$dev."OrderLineItemRecordType" AS ENUM ('PhysicalProduct', 'ProductVariant', 'ExternalProduct', 'Package', 'EarlySwap', 'Reservation');
ALTER TABLE monsoon$dev."OrderLineItem" ALTER COLUMN "recordType" TYPE monsoon$dev."OrderLineItemRecordType" USING "recordType"::text::monsoon$dev."OrderLineItemRecordType";


CREATE TYPE monsoon$dev."OrderStatus" AS ENUM ('Drafted', 'Submitted', 'Fulfilled', 'Returned', 'Cancelled');
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "status" TYPE monsoon$dev."OrderStatus" USING "status"::text::monsoon$dev."OrderStatus";


CREATE TYPE monsoon$dev."OrderCancelReason" AS ENUM ('Customer', 'Declined', 'Fraud', 'Inventory', 'Other');
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "cancelReason" TYPE monsoon$dev."OrderCancelReason" USING "cancelReason"::text::monsoon$dev."OrderCancelReason";


CREATE TYPE monsoon$dev."OrderPaymentStatus" AS ENUM ('Paid', 'PartiallyPaid', 'Refunded', 'NotPaid', 'Complete');

UPDATE monsoon$dev."Order"
SET "paymentStatus" = 'Complete'
WHERE  monsoon$dev."Order"."paymentStatus" = 'complete';
      
ALTER TABLE monsoon$dev."Order" ALTER COLUMN "paymentStatus" TYPE monsoon$dev."OrderPaymentStatus" USING "paymentStatus"::text::monsoon$dev."OrderPaymentStatus";


CREATE TYPE monsoon$dev."AdminAction" AS ENUM ('Insert', 'Delete', 'Update', 'Truncate');
ALTER TABLE monsoon$dev."AdminActionLog" ALTER COLUMN "action" TYPE monsoon$dev."AdminAction" USING "action"::text::monsoon$dev."AdminAction";


CREATE TYPE monsoon$dev."SyncTimingType" AS ENUM ('Drip', 'Next', 'Impact');
ALTER TABLE monsoon$dev."SyncTiming" ALTER COLUMN "type" TYPE monsoon$dev."SyncTimingType" USING "type"::text::monsoon$dev."SyncTimingType";


