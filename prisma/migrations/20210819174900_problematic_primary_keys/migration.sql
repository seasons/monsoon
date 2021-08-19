/*
  Warnings:

  - You are about to drop the column `lostAt` on the `Reservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productVariant,user]` on the table `ProductVariantWant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reservation]` on the table `ReservationFeedback` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[origin,destination,shippingMethod]` on the table `ShippingOption` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[top]` on the table `Size` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "lostAt";

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantWant.productVariant_user_unique" ON "ProductVariantWant"("productVariant", "user");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationFeedback_reservation_unique" ON "ReservationFeedback"("reservation");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingOption.origin_destination_shippingMethod_unique" ON "ShippingOption"("origin", "destination", "shippingMethod");

-- CreateIndex
CREATE UNIQUE INDEX "Size_top_unique" ON "Size"("top");
