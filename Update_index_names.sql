

ALTER INDEX monsoon$dev."monsoon$production.Brand.brandCode._UNIQUE" RENAME TO "Brand.brandCode_unique";
ALTER INDEX monsoon$dev."monsoon$production.Brand.slug._UNIQUE" RENAME TO "Brand.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.Category.name._UNIQUE" RENAME TO "Category.name_unique";
ALTER INDEX monsoon$dev."monsoon$production.Category.slug._UNIQUE" RENAME TO "Category.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.Collection.slug._UNIQUE" RENAME TO "Collection.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.Color.colorCode._UNIQUE" RENAME TO "Color.colorCode_unique";
ALTER INDEX monsoon$dev."monsoon$production.Color.slug._UNIQUE" RENAME TO "Color.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.Customer.referralLink._UNIQUE" RENAME TO "Customer.referralLink_unique";

ALTER INDEX monsoon$dev."monsoon$production.Image.url._UNIQUE" RENAME TO "Image.url_unique";

ALTER INDEX monsoon$dev."monsoon$production.Location.slug._UNIQUE" RENAME TO "Location.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.Order.orderNumber._UNIQUE" RENAME TO "Order.orderNumber_unique";

ALTER INDEX monsoon$dev."monsoon$production.PaymentPlan.planID._UNIQUE" RENAME TO "PaymentPlan.planID_unique";

ALTER INDEX monsoon$dev."monsoon$production.PhysicalProduct.seasonsUID._UNIQUE" RENAME TO "PhysicalProduct.seasonsUID_unique";

ALTER INDEX monsoon$dev."monsoon$production.Product.slug._UNIQUE" RENAME TO "Product.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.ProductFunction.name._UNIQUE" RENAME TO "ProductFunction.name_unique";

ALTER INDEX monsoon$dev."monsoon$production.ProductMaterialCategory.slug._UNIQUE" RENAME TO "ProductMaterialCategory.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.ProductModel.name._UNIQUE" RENAME TO "ProductModel.name_unique";

ALTER INDEX monsoon$dev."monsoon$production.ProductVariant.sku._UNIQUE" RENAME TO "ProductVariant.sku_unique";

ALTER INDEX monsoon$dev."monsoon$production.Reservation.reservationNumber._UNIQUE" RENAME TO "Reservation.reservationNumber_unique";

ALTER INDEX monsoon$dev."monsoon$production.ShopifyProductVariant.externalId._UNIQUE" RENAME TO "ShopifyProductVariant.externalId_unique";

ALTER INDEX monsoon$dev."monsoon$production.ShopifyShop.shopName._UNIQUE" RENAME TO "ShopifyShop.shopName_unique";

ALTER INDEX monsoon$dev."monsoon$production.Size.slug._UNIQUE" RENAME TO "Size.slug_unique";

ALTER INDEX monsoon$dev."monsoon$production.Tag.name._UNIQUE" RENAME TO "Tag.name_unique";

ALTER INDEX monsoon$dev."monsoon$production.User.auth0Id._UNIQUE" RENAME TO "User.auth0Id_unique";
ALTER INDEX monsoon$dev."monsoon$production.User.email._UNIQUE" RENAME TO "User.email_unique";

ALTER INDEX monsoon$dev."monsoon$production.WarehouseLocation.barcode._UNIQUE" RENAME TO "WarehouseLocation.barcode_unique";

------

ALTER INDEX monsoon$dev."_BrandToImage_AB_unique" RENAME TO "_BrandToBrandImages_AB_unique";
ALTER INDEX monsoon$dev."_BrandToImage_B" RENAME TO "_BrandToBrandImages_B_index";

ALTER INDEX monsoon$dev."_CategoryToChildren_B" RENAME TO "_CategoryToChildren_B_index";

ALTER INDEX monsoon$dev."_CollectionToImage_B" RENAME TO "_CollectionToImage_B_index";

ALTER INDEX monsoon$dev."_CollectionToProduct_B" RENAME TO "_CollectionToProduct_B_index";

ALTER INDEX monsoon$dev."_CustomerToEmailedProducts_B" RENAME TO "_CustomerToEmailedProducts_B_index";

ALTER INDEX monsoon$dev."_FitPicToProduct_B" RENAME TO "_FitPicToProduct_B_index";

ALTER INDEX monsoon$dev."_ImageToProduct_B" RENAME TO "_ImageToProduct_B_index";

ALTER INDEX monsoon$dev."_OrderToOrderLineItem_B" RENAME TO "_OrderToOrderLineItem_B_index";

ALTER INDEX monsoon$dev."_PackageToPhysicalProduct_B" RENAME TO "_PackageToPhysicalProduct_B_index";

ALTER INDEX monsoon$dev."_ProductToProductFunction_B" RENAME TO "_ProductToProductFunction_B_index";

ALTER INDEX monsoon$dev."_ProductToTag_B" RENAME TO "_ProductToTag_B_index";

ALTER INDEX monsoon$dev."_ProductVariantManufacturerSize_B" RENAME TO "_ProductVariantManufacturerSize_B_index";

ALTER INDEX monsoon$dev."_PhysicalProductToReservation_AB_unique" RENAME TO "_ReservationToAllProducts_AB_unique";
ALTER INDEX monsoon$dev."_PhysicalProductToReservation_B" RENAME TO "_ReservationToAllProducts_B_index";

ALTER INDEX monsoon$dev."_ReservationToNewProducts_B" RENAME TO "_ReservationToNewProducts_B_index";

ALTER INDEX monsoon$dev."_ReservationToReturnedProducts_B" RENAME TO "_ReservationToReturnedProducts_B_index";

ALTER INDEX monsoon$dev."_PushNotificationReceiptToUser_AB_unique" RENAME TO "_UserToPushNotificationReceipts_AB_unique";
ALTER INDEX monsoon$dev."_PushNotificationReceiptToUser_B" RENAME TO "_UserToPushNotificationReceipts_B_index";

-- ALTER INDEX monsoon$dev."_WarehouseLocationToWarehouseLocationConstraint_B" RENAME TO "_WarehouseLocationToWarehouseLocationConstraint_B_index";