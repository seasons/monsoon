/*
  Warnings:

  - A unique constraint covering the columns `[productVariant]` on the table `ProductVariantWant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shippingOption]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservation]` on the table `ReservationFeedback` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shippingMethod]` on the table `ShippingOption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[top]` on the table `Size` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "dryCleaningFee" DOUBLE PRECISION,
ADD COLUMN     "recoupment" DOUBLE PRECISION NOT NULL DEFAULT 4,
ADD COLUMN     "singularName" TEXT,
ALTER COLUMN "image" SET DATA TYPE JSONB;

-- AlterTable
ALTER TABLE "SmsReceipt" ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantWant_productVariant_unique" ON "ProductVariantWant"("productVariant");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_shippingOption_unique" ON "Reservation"("shippingOption");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationFeedback_reservation_unique" ON "ReservationFeedback"("reservation");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingOption_shippingMethod_unique" ON "ShippingOption"("shippingMethod");

-- CreateIndex
CREATE UNIQUE INDEX "Size_top_unique" ON "Size"("top");
