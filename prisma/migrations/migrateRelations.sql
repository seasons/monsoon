
ALTER TABLE monsoon$dev."Product" ADD COLUMN "materialCategory" VARCHAR(30);
ALTER TABLE monsoon$dev."Product" ADD CONSTRAINT fk_materialCategory
FOREIGN KEY ("materialCategory")
REFERENCES monsoon$dev."ProductMaterialCategory"("id");

UPDATE monsoon$dev."Product"
SET "materialCategory" = monsoon$dev."_ProductToProductMaterialCategory"."B"
FROM monsoon$dev."_ProductToProductMaterialCategory"
WHERE  monsoon$dev."_ProductToProductMaterialCategory"."A" = monsoon$dev."Product"."id";

DROP TABLE monsoon$dev."_ProductToProductMaterialCategory";


ALTER TABLE monsoon$dev."Product" ADD COLUMN "model" VARCHAR(30);
ALTER TABLE monsoon$dev."Product" ADD CONSTRAINT fk_model
FOREIGN KEY ("model")
REFERENCES monsoon$dev."ProductModel"("id");

UPDATE monsoon$dev."Product"
SET "model" = monsoon$dev."_ProductToProductModel"."B"
FROM monsoon$dev."_ProductToProductModel"
WHERE  monsoon$dev."_ProductToProductModel"."A" = monsoon$dev."Product"."id";

DROP TABLE monsoon$dev."_ProductToProductModel";


ALTER TABLE monsoon$dev."ProductVariant"
DROP COLUMN "productID";

ALTER TABLE monsoon$dev."ProductVariant" ADD COLUMN "product" VARCHAR(30);
ALTER TABLE monsoon$dev."ProductVariant" ADD CONSTRAINT fk_product
FOREIGN KEY ("product")
REFERENCES monsoon$dev."Product"("id");

UPDATE monsoon$dev."ProductVariant"
SET "product" = monsoon$dev."_ProductToProductVariant"."A"
FROM monsoon$dev."_ProductToProductVariant"
WHERE  monsoon$dev."_ProductToProductVariant"."B" = monsoon$dev."ProductVariant"."id";

DROP TABLE monsoon$dev."_ProductToProductVariant";


ALTER TABLE monsoon$dev."ProductVariantFeedback" ADD COLUMN "reservationFeedback" VARCHAR(30);
ALTER TABLE monsoon$dev."ProductVariantFeedback" ADD CONSTRAINT fk_reservationFeedback
FOREIGN KEY ("reservationFeedback")
REFERENCES monsoon$dev."ReservationFeedback"("id");

UPDATE monsoon$dev."ProductVariantFeedback"
SET "reservationFeedback" = monsoon$dev."_ProductVariantFeedbackToReservationFeedback"."B"
FROM monsoon$dev."_ProductVariantFeedbackToReservationFeedback"
WHERE  monsoon$dev."_ProductVariantFeedbackToReservationFeedback"."A" = monsoon$dev."ProductVariantFeedback"."id";

DROP TABLE monsoon$dev."_ProductVariantFeedbackToReservationFeedback";


ALTER TABLE monsoon$dev."ProductVariantFeedbackQuestion" ADD COLUMN "variantFeedback" VARCHAR(30);
ALTER TABLE monsoon$dev."ProductVariantFeedbackQuestion" ADD CONSTRAINT fk_variantFeedback
FOREIGN KEY ("variantFeedback")
REFERENCES monsoon$dev."ProductVariantFeedback"("id");

UPDATE monsoon$dev."ProductVariantFeedbackQuestion"
SET "variantFeedback" = monsoon$dev."_ProductVariantFeedbackToProductVariantFeedbackQuestion"."A"
FROM monsoon$dev."_ProductVariantFeedbackToProductVariantFeedbackQuestion"
WHERE  monsoon$dev."_ProductVariantFeedbackToProductVariantFeedbackQuestion"."B" = monsoon$dev."ProductVariantFeedbackQuestion"."id";

DROP TABLE monsoon$dev."_ProductVariantFeedbackToProductVariantFeedbackQuestion";


ALTER TABLE monsoon$dev."PushNotificationReceipt" ADD COLUMN "userPushNotification" VARCHAR(30);
ALTER TABLE monsoon$dev."PushNotificationReceipt" ADD CONSTRAINT fk_userPushNotification
FOREIGN KEY ("userPushNotification")
REFERENCES monsoon$dev."UserPushNotification"("id");

UPDATE monsoon$dev."PushNotificationReceipt"
SET "userPushNotification" = monsoon$dev."_PushNotificationReceiptToUserPushNotification"."B"
FROM monsoon$dev."_PushNotificationReceiptToUserPushNotification"
WHERE  monsoon$dev."_PushNotificationReceiptToUserPushNotification"."A" = monsoon$dev."PushNotificationReceipt"."id";

DROP TABLE monsoon$dev."_PushNotificationReceiptToUserPushNotification";


ALTER TABLE monsoon$dev."ReservationReceiptItem" ADD COLUMN "receipt" VARCHAR(30);
ALTER TABLE monsoon$dev."ReservationReceiptItem" ADD CONSTRAINT fk_receipt
FOREIGN KEY ("receipt")
REFERENCES monsoon$dev."ReservationReceipt"("id");

UPDATE monsoon$dev."ReservationReceiptItem"
SET "receipt" = monsoon$dev."_ReservationReceiptToReservationReceiptItem"."A"
FROM monsoon$dev."_ReservationReceiptToReservationReceiptItem"
WHERE  monsoon$dev."_ReservationReceiptToReservationReceiptItem"."B" = monsoon$dev."ReservationReceiptItem"."id";

DROP TABLE monsoon$dev."_ReservationReceiptToReservationReceiptItem";


ALTER TABLE monsoon$dev."ShopifyProductVariantSelectedOption" ADD COLUMN "shopifyProductVariant" VARCHAR(30);
ALTER TABLE monsoon$dev."ShopifyProductVariantSelectedOption" ADD CONSTRAINT fk_shopifyProductVariant
FOREIGN KEY ("shopifyProductVariant")
REFERENCES monsoon$dev."ShopifyProductVariant"("id");

UPDATE monsoon$dev."ShopifyProductVariantSelectedOption"
SET "shopifyProductVariant" = monsoon$dev."_ShopifyProductVariantToVariantSelectedOption"."A"
FROM monsoon$dev."_ShopifyProductVariantToVariantSelectedOption"
WHERE  monsoon$dev."_ShopifyProductVariantToVariantSelectedOption"."B" = monsoon$dev."ShopifyProductVariantSelectedOption"."id";

DROP TABLE monsoon$dev."_ShopifyProductVariantToVariantSelectedOption";


ALTER TABLE monsoon$dev."SmsReceipt" ADD COLUMN "user" VARCHAR(30);
ALTER TABLE monsoon$dev."SmsReceipt" ADD CONSTRAINT fk_user
FOREIGN KEY ("user")
REFERENCES monsoon$dev."User"("id");

UPDATE monsoon$dev."SmsReceipt"
SET "user" = monsoon$dev."_UserToSmsReceipts"."A"
FROM monsoon$dev."_UserToSmsReceipts"
WHERE  monsoon$dev."_UserToSmsReceipts"."B" = monsoon$dev."SmsReceipt"."id";

DROP TABLE monsoon$dev."_UserToSmsReceipts";


ALTER TABLE monsoon$dev."UserPushNotificationInterest" ADD COLUMN "userPushNotification" VARCHAR(30);
ALTER TABLE monsoon$dev."UserPushNotificationInterest" ADD CONSTRAINT fk_userPushNotification
FOREIGN KEY ("userPushNotification")
REFERENCES monsoon$dev."UserPushNotification"("id");

UPDATE monsoon$dev."UserPushNotificationInterest"
SET "userPushNotification" = monsoon$dev."_UserPushNotificationToUserPushNotificationInterest"."A"
FROM monsoon$dev."_UserPushNotificationToUserPushNotificationInterest"
WHERE  monsoon$dev."_UserPushNotificationToUserPushNotificationInterest"."B" = monsoon$dev."UserPushNotificationInterest"."id";

DROP TABLE monsoon$dev."_UserPushNotificationToUserPushNotificationInterest";


ALTER TABLE monsoon$dev."CustomerNotificationBarReceipt" ADD COLUMN "customer" VARCHAR(30);
ALTER TABLE monsoon$dev."CustomerNotificationBarReceipt" ADD CONSTRAINT fk_customer
FOREIGN KEY ("customer")
REFERENCES monsoon$dev."Customer"("id");

UPDATE monsoon$dev."CustomerNotificationBarReceipt"
SET "customer" = monsoon$dev."_CustomerToCustomerNotificationBarReceipts"."A"
FROM monsoon$dev."_CustomerToCustomerNotificationBarReceipts"
WHERE  monsoon$dev."_CustomerToCustomerNotificationBarReceipts"."B" = monsoon$dev."CustomerNotificationBarReceipt"."id";

DROP TABLE monsoon$dev."_CustomerToCustomerNotificationBarReceipts";


ALTER TABLE monsoon$dev."PhysicalProduct" ADD COLUMN "productVariant" VARCHAR(30);
ALTER TABLE monsoon$dev."PhysicalProduct" ADD CONSTRAINT fk_productVariant
FOREIGN KEY ("productVariant")
REFERENCES monsoon$dev."ProductVariant"("id");

UPDATE monsoon$dev."PhysicalProduct"
SET "productVariant" = monsoon$dev."_PhysicalProductToProductVariant"."B"
FROM monsoon$dev."_PhysicalProductToProductVariant"
WHERE  monsoon$dev."_PhysicalProductToProductVariant"."A" = monsoon$dev."PhysicalProduct"."id";

DROP TABLE monsoon$dev."_PhysicalProductToProductVariant";


ALTER TABLE monsoon$dev."SyncTiming" ADD COLUMN "customer" VARCHAR(30);
ALTER TABLE monsoon$dev."SyncTiming" ADD CONSTRAINT fk_customer
FOREIGN KEY ("customer")
REFERENCES monsoon$dev."Customer"("id");

UPDATE monsoon$dev."SyncTiming"
SET "customer" = monsoon$dev."_CustomerToSyncTiming"."A"
FROM monsoon$dev."_CustomerToSyncTiming"
WHERE  monsoon$dev."_CustomerToSyncTiming"."B" = monsoon$dev."SyncTiming"."id";

DROP TABLE monsoon$dev."_CustomerToSyncTiming";

