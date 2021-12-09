/*
  Warnings:

  - A unique constraint covering the columns `[sequenceNumber]` on the table `PhysicalProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PhysicalProduct.sequenceNumber_unique" ON "PhysicalProduct"("sequenceNumber");
