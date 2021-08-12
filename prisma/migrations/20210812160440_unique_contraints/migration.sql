/*
  Warnings:

  - You are about to alter the column `bridge` on the `AccessorySize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `length` on the `AccessorySize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `width` on the `AccessorySize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `waist` on the `BottomSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `rise` on the `BottomSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `hem` on the `BottomSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `inseam` on the `BottomSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `referrerId` on the `Customer` table. All the data in the column will be lost.
  - You are about to alter the column `lat` on the `Location` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lng` on the `Location` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxRate` on the `OrderLineItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `taxPercentage` on the `OrderLineItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `weight` on the `Package` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `unitCost` on the `PhysicalProduct` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `buyUsedPrice` on the `PhysicalProductPrice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lifeExpectancy` on the `ProductMaterialCategory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `height` on the `ProductModel` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `weight` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `height` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `retailPrice` on the `ProductVariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `rating` on the `ProductVariantFeedback` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `retailPrice` on the `ProductVariantPrice` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `cachedPrice` on the `ShopifyProductVariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `sleeve` on the `TopSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `shoulder` on the `TopSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `chest` on the `TopSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `neck` on the `TopSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `length` on the `TopSize` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - A unique constraint covering the columns `[admin]` on the table `ActiveAdminUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shopifyShop]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[billingInfo]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[detail]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[utm]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stylePreferences]` on the table `CustomerDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customer]` on the table `CustomerMembership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscription]` on the table `CustomerMembership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sentPackage]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shippingLabel]` on the table `Package` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[price]` on the table `PhysicalProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[modelSize]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[season]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[internalSize]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[price]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productVariant]` on the table `ProductVariantWant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receipt]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shippingOption]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservation]` on the table `ReservationFeedback` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shippingMethod]` on the table `ShippingOption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productVariant]` on the table `ShopifyProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessory]` on the table `Size` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bottom]` on the table `Size` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceData]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pushNotification]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customer` on table `CustomerMembership` required. This step will fail if there are existing NULL values in that column.
  - Made the column `plan` on table `CustomerMembership` required. This step will fail if there are existing NULL values in that column.
  - Made the column `variantFeedback` on table `ProductVariantFeedbackQuestion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shopifyProductVariant` on table `ShopifyProductVariantSelectedOption` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AccessorySize" ALTER COLUMN "bridge" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "length" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "width" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "BlogPost" ALTER COLUMN "published" SET DEFAULT true;

-- AlterTable
ALTER TABLE "BottomSize" ALTER COLUMN "waist" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "rise" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "hem" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "inseam" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "isPrimaryBrand" SET DEFAULT false,
ALTER COLUMN "published" SET DEFAULT true,
ALTER COLUMN "featured" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "visible" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "referrerId";

-- AlterTable
ALTER TABLE "CustomerAdmissionsData" ALTER COLUMN "inServiceableZipcode" SET DEFAULT false,
ALTER COLUMN "authorizationsCount" SET DEFAULT 0,
ALTER COLUMN "allAccessEnabled" SET DEFAULT false;

-- AlterTable
ALTER TABLE "CustomerDetail" ALTER COLUMN "insureShipment" SET DEFAULT false;

-- AlterTable
ALTER TABLE "CustomerMembership" ALTER COLUMN "customer" SET NOT NULL,
ALTER COLUMN "plan" SET NOT NULL;

-- AlterTable
ALTER TABLE "CustomerNotificationBarReceipt" ALTER COLUMN "viewCount" SET DEFAULT 0,
ALTER COLUMN "clickCount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "FitPic" ALTER COLUMN "status" SET DEFAULT E'Submitted';

-- AlterTable
ALTER TABLE "FitPicReport" ALTER COLUMN "status" SET DEFAULT E'Pending',
ALTER COLUMN "reportedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "lat" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lng" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT E'NotPaid';

-- AlterTable
ALTER TABLE "OrderLineItem" ALTER COLUMN "taxRate" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxPercentage" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "weight" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PauseRequest" ALTER COLUMN "notified" SET DEFAULT false,
ALTER COLUMN "pauseType" SET DEFAULT E'WithoutItems';

-- AlterTable
ALTER TABLE "PhysicalProduct" ALTER COLUMN "unitCost" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PhysicalProductPrice" ALTER COLUMN "buyUsedPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "recoupment" SET DEFAULT 4;

-- AlterTable
ALTER TABLE "ProductMaterialCategory" ALTER COLUMN "lifeExpectancy" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductModel" ALTER COLUMN "height" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "weight" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "height" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "retailPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariantFeedback" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProductVariantFeedbackQuestion" ALTER COLUMN "variantFeedback" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariantPrice" ALTER COLUMN "retailPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PushNotificationReceipt" ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RecentlyViewedProduct" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ReservationReceipt" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ShopifyProductVariant" ALTER COLUMN "cachedPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ShopifyProductVariantSelectedOption" ALTER COLUMN "shopifyProductVariant" SET NOT NULL;

-- AlterTable
ALTER TABLE "TopSize" ALTER COLUMN "sleeve" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "shoulder" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "chest" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "neck" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "length" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "pushNotificationStatus" SET DEFAULT E'Denied',
ALTER COLUMN "verificationStatus" SET DEFAULT E'Pending',
ALTER COLUMN "verificationMethod" SET DEFAULT E'None';

-- CreateIndex
CREATE UNIQUE INDEX "ActiveAdminUser_admin_unique" ON "ActiveAdminUser"("admin");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_shopifyShop_unique" ON "Brand"("shopifyShop");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_billingInfo_unique" ON "Customer"("billingInfo");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_detail_unique" ON "Customer"("detail");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_user_unique" ON "Customer"("user");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_utm_unique" ON "Customer"("utm");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDetail_stylePreferences_unique" ON "CustomerDetail"("stylePreferences");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerMembership_customer_unique" ON "CustomerMembership"("customer");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerMembership_subscription_unique" ON "CustomerMembership"("subscription");

-- CreateIndex
CREATE UNIQUE INDEX "Order_sentPackage_unique" ON "Order"("sentPackage");

-- CreateIndex
CREATE UNIQUE INDEX "Package_shippingLabel_unique" ON "Package"("shippingLabel");

-- CreateIndex
CREATE UNIQUE INDEX "PhysicalProduct_price_unique" ON "PhysicalProduct"("price");

-- CreateIndex
CREATE UNIQUE INDEX "Product_modelSize_unique" ON "Product"("modelSize");

-- CreateIndex
CREATE UNIQUE INDEX "Product_season_unique" ON "Product"("season");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_internalSize_unique" ON "ProductVariant"("internalSize");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_price_unique" ON "ProductVariant"("price");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantWant_productVariant_unique" ON "ProductVariantWant"("productVariant");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_receipt_unique" ON "Reservation"("receipt");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_shippingOption_unique" ON "Reservation"("shippingOption");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationFeedback_reservation_unique" ON "ReservationFeedback"("reservation");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingOption_shippingMethod_unique" ON "ShippingOption"("shippingMethod");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyProductVariant_productVariant_unique" ON "ShopifyProductVariant"("productVariant");

-- CreateIndex
CREATE UNIQUE INDEX "Size_accessory_unique" ON "Size"("accessory");

-- CreateIndex
CREATE UNIQUE INDEX "Size_bottom_unique" ON "Size"("bottom");

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceData_unique" ON "User"("deviceData");

-- CreateIndex
CREATE UNIQUE INDEX "User_pushNotification_unique" ON "User"("pushNotification");
