ALTER TABLE monsoon$staging."AccessorySize" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ActiveAdminUser" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ActiveAdminUser" ALTER COLUMN "adminId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."AdminActionLog" ALTER COLUMN "actionId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."AdminActionLog" ALTER COLUMN "entityId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."AdminActionLog" ALTER COLUMN "activeAdminUserId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."AdminActionLogInterpretation" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."AdminActionLogInterpretation" ALTER COLUMN "entityId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."AdminActionLogInterpretation" ALTER COLUMN "logId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BagItem" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."BagItem" ALTER COLUMN "customerId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."BagItem" ALTER COLUMN "productVariantId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BillingInfo" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BlogPost" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."BlogPost" ALTER COLUMN "imageId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BlogPost_tags" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BottomSize" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Brand" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Brand" ALTER COLUMN "logoImageId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Brand" ALTER COLUMN "shopifyShopId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Category" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Collection" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Collection_descriptions" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Collection_placements" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Color" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "detailId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "userId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "billingInfoId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "admissionsId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "referrerId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "utmId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerAdmissionsData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerDetail" ALTER COLUMN "shippingAddressId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerDetail" ALTER COLUMN "stylePreferencesId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_styles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_topSizes" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_waistSizes" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_weight" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "customerId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "planId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "giftId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "membershipSubscriptionId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerMembershipSubscriptionData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerNotificationBarReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."EmailReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."EmailReceipt" ALTER COLUMN "emailId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."EmailReceipt" ALTER COLUMN "userId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "locationId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "userId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "imageId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."FitPicReport" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPicReport" ALTER COLUMN "reporterId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPicReport" ALTER COLUMN "reportedId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Image" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."InterestedUser" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Label" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Launch" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Launch" ALTER COLUMN "collectionId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Launch" ALTER COLUMN "brandId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Location" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Location" ALTER COLUMN "userId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Order" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Order" ALTER COLUMN "customerId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Order" ALTER COLUMN "sentPackageId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."OrderLineItem" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Package" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Package" ALTER COLUMN "fromAddressId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Package" ALTER COLUMN "toAddressId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Package" ALTER COLUMN "shippingLabelId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PackageTransitEvent" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PackageTransitEvent" ALTER COLUMN "packageId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PackageTransitEvent" ALTER COLUMN "reservationId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PauseRequest" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PauseRequest" ALTER COLUMN "membershipId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PaymentPlan" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "locationId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "warehouseLocationId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "priceId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProductPrice" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProductQualityReport" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProductQualityReport" ALTER COLUMN "physicalProductId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProductQualityReport" ALTER COLUMN "userId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProductQualityReport_damageTypes" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "categoryId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "colorId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "secondaryColorId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "brandId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "modelSizeId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "seasonId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "tierId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductFunction" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product_innerMaterials" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product_styles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductMaterialCategory" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductMaterialCategory" ALTER COLUMN "categoryId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductModel" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "productVariantId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "physicalProductId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "customerId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product_outerMaterials" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductRequest" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductRequest" ALTER COLUMN "userId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductRequest_images" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductSeason" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductSeason" ALTER COLUMN "vendorSeasonId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductSeason" ALTER COLUMN "internalSeasonId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductSeason_wearableSeasons" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductTier" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "colorId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "internalSizeId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "priceId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedback" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariantFeedback" ALTER COLUMN "variantId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedbackQuestion" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedbackQuestion_options" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedbackQuestion_responses" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantPrice" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantWant" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariantWant" ALTER COLUMN "productVariantId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariantWant" ALTER COLUMN "userId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PushNotificationReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."RecentlyViewedProduct" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."RecentlyViewedProduct" ALTER COLUMN "productId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."RecentlyViewedProduct" ALTER COLUMN "customerId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "userId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "lastLocationId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "customerId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "sentPackageId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "returnedPackageId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "receiptId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "shippingOptionId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ReservationFeedback" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationFeedback" ALTER COLUMN "userId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationFeedback" ALTER COLUMN "reservationId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ReservationReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ReservationReceiptItem" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationReceiptItem" ALTER COLUMN "productId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationReceiptItem" ALTER COLUMN "reservationReceiptId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Season" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShippingMethod" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "destinationId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "originId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "shippingMethodId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "externalId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "imageId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "brandId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "productVariantId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "shopId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyProductVariantSelectedOption" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Size" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Size" ALTER COLUMN "topId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Size" ALTER COLUMN "bottomId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Size" ALTER COLUMN "accessoryId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."SmsReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."SmsReceipt" ALTER COLUMN "externalId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."SmsReceipt_mediaUrls" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."StylePreferences" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."StylePreferences_brands" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."StylePreferences_colors" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."StylePreferences_patterns" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."StylePreferences_styles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."SyncTiming" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Tag" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."TopSize" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."User" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."User" ALTER COLUMN "pushNotificationId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."User" ALTER COLUMN "deviceDataId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UserDeviceData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UserPushNotification" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UserPushNotificationInterest" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."UserPushNotificationInterest" ALTER COLUMN "userId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."User_roles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UTMData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."WarehouseLocation" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."WarehouseLocationConstraint" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."WarehouseLocationConstraint" ALTER COLUMN "categoryId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyShop" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyShop_scope" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

