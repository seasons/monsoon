/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `ShippingMethod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShippingMethod.code_unique" ON "ShippingMethod"("code");
