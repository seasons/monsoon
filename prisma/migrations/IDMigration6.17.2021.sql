
-- RECORD TABLES
ALTER TABLE monsoon$staging."AccessorySize" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ActiveAdminUser" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ActiveAdminUser" ALTER COLUMN "admin" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."AdminActionLog" ALTER COLUMN "entityId" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."AdminActionLog" ALTER COLUMN "activeAdminUser" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."AdminActionLogInterpretation" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."AdminActionLogInterpretation" ALTER COLUMN "entityId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BagItem" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."BagItem" ALTER COLUMN "customer" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."BagItem" ALTER COLUMN "productVariant" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BillingInfo" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BlogPost" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."BlogPost" ALTER COLUMN "image" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BlogPost_tags" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."BottomSize" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Brand" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Brand" ALTER COLUMN "logoImage" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Brand" ALTER COLUMN "shopifyShop" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Category" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Collection" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Collection_descriptions" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Collection_placements" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Color" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "detail" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "user" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "billingInfo" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "admissions" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "referrer" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Customer" ALTER COLUMN "utm" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerAdmissionsData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerDetail" ALTER COLUMN "shippingAddress" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerDetail" ALTER COLUMN "stylePreferences" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_styles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_topSizes" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_waistSizes" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerDetail_weight" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "customer" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "plan" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."CustomerMembership" ALTER COLUMN "subscription" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerMembershipSubscriptionData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."CustomerNotificationBarReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."EmailReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."EmailReceipt" ALTER COLUMN "user" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "location" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "user" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPic" ALTER COLUMN "image" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."FitPicReport" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPicReport" ALTER COLUMN "reporter" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."FitPicReport" ALTER COLUMN "reported" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Image" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."InterestedUser" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Label" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Launch" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Launch" ALTER COLUMN "collection" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Launch" ALTER COLUMN "brand" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Location" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Location" ALTER COLUMN "user" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Order" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Order" ALTER COLUMN "customer" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Order" ALTER COLUMN "sentPackage" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."OrderLineItem" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."OrderLineItem" ALTER COLUMN "recordID" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Package" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Package" ALTER COLUMN "fromAddress" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Package" ALTER COLUMN "toAddress" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Package" ALTER COLUMN "shippingLabel" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PackageTransitEvent" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PackageTransitEvent" ALTER COLUMN "package" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PackageTransitEvent" ALTER COLUMN "reservation" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PauseRequest" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PauseRequest" ALTER COLUMN "membership" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PaymentPlan" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "location" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "warehouseLocation" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProduct" ALTER COLUMN "price" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProductPrice" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProductQualityReport" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProductQualityReport" ALTER COLUMN "physicalProduct" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."PhysicalProductQualityReport" ALTER COLUMN "user" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PhysicalProductQualityReport_damageTypes" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "category" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "color" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "secondaryColor" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "brand" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "modelSize" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "season" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Product" ALTER COLUMN "tier" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductFunction" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product_innerMaterials" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product_styles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductMaterialCategory" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductMaterialCategory" ALTER COLUMN "category" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductModel" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "productVariant" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "physicalProduct" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductNotification" ALTER COLUMN "customer" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Product_outerMaterials" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductRequest" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductRequest" ALTER COLUMN "user" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductRequest_images" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductSeason" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductSeason" ALTER COLUMN "vendorSeason" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductSeason" ALTER COLUMN "internalSeason" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductSeason_wearableSeasons" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductTier" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "color" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "internalSize" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariant" ALTER COLUMN "price" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedback" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariantFeedback" ALTER COLUMN "variant" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedbackQuestion" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedbackQuestion_options" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantFeedbackQuestion_responses" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantPrice" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ProductVariantWant" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariantWant" ALTER COLUMN "productVariant" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ProductVariantWant" ALTER COLUMN "user" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."PushNotificationReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."RecentlyViewedProduct" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."RecentlyViewedProduct" ALTER COLUMN "product" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."RecentlyViewedProduct" ALTER COLUMN "customer" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "user" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "lastLocation" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "customer" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "sentPackage" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "returnedPackage" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "receipt" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Reservation" ALTER COLUMN "shippingOption" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ReservationFeedback" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationFeedback" ALTER COLUMN "user" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationFeedback" ALTER COLUMN "reservation" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ReservationReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ReservationReceiptItem" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ReservationReceiptItem" ALTER COLUMN "product" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Season" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShippingMethod" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "destination" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "origin" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShippingOption" ALTER COLUMN "shippingMethod" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "image" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "brand" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "productVariant" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."ShopifyProductVariant" ALTER COLUMN "shop" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyProductVariantSelectedOption" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."Size" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Size" ALTER COLUMN "top" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Size" ALTER COLUMN "bottom" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."Size" ALTER COLUMN "accessory" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."SmsReceipt" ALTER COLUMN "id" SET DATA TYPE character varying(30);

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
ALTER TABLE monsoon$staging."User" ALTER COLUMN "pushNotification" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."User" ALTER COLUMN "deviceData" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UserDeviceData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UserPushNotification" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UserPushNotificationInterest" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."UserPushNotificationInterest" ALTER COLUMN "user" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."User_roles" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."UTMData" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."WarehouseLocation" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."WarehouseLocationConstraint" ALTER COLUMN "id" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."WarehouseLocationConstraint" ALTER COLUMN "category" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyShop" ALTER COLUMN "id" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."ShopifyShop_scope" ALTER COLUMN "nodeId" SET DATA TYPE character varying(30);

-- JOIN TABLES
ALTER TABLE monsoon$staging."_UserToSmsReceipts" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductVariant" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CategoryToChildren" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationToNewProducts" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_FitPicToProduct" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductVariantFeedbackToReservationFeedback" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_BrandToBrandImages" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_UserPushNotificationToUserPushNotificationInterest" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToTag" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductVariantManufacturerSize" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CustomerToEmailedProducts" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationReceiptToReservationReceiptItem" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CollectionToProduct" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_PackageToPhysicalProduct" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationToAllProducts" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductModel" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ImageToProduct" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductFunction" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_PhysicalProductToProductVariant" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_WarehouseLocationToWarehouseLocationConstraint" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductVariantFeedbackToProductVariantFeedbackQuestion" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductMaterialCategory" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_UserToPushNotificationReceipts" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_PushNotificationReceiptToUserPushNotification" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_OrderToOrderLineItem" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CustomerToCustomerNotificationBarReceipts" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CustomerToSyncTiming" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ShopifyProductVariantToVariantSelectedOption" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CollectionToImage" ALTER COLUMN "A" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationToReturnedProducts" ALTER COLUMN "A" SET DATA TYPE character varying(30);

ALTER TABLE monsoon$staging."_UserToSmsReceipts" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductVariant" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CategoryToChildren" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationToNewProducts" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_FitPicToProduct" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductVariantFeedbackToReservationFeedback" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_BrandToBrandImages" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_UserPushNotificationToUserPushNotificationInterest" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToTag" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductVariantManufacturerSize" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CustomerToEmailedProducts" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationReceiptToReservationReceiptItem" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CollectionToProduct" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_PackageToPhysicalProduct" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationToAllProducts" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductModel" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ImageToProduct" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductFunction" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_PhysicalProductToProductVariant" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_WarehouseLocationToWarehouseLocationConstraint" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductVariantFeedbackToProductVariantFeedbackQuestion" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ProductToProductMaterialCategory" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_UserToPushNotificationReceipts" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_PushNotificationReceiptToUserPushNotification" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_OrderToOrderLineItem" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CustomerToCustomerNotificationBarReceipts" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CustomerToSyncTiming" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ShopifyProductVariantToVariantSelectedOption" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_CollectionToImage" ALTER COLUMN "B" SET DATA TYPE character varying(30);
ALTER TABLE monsoon$staging."_ReservationToReturnedProducts" ALTER COLUMN "B" SET DATA TYPE character varying(30);