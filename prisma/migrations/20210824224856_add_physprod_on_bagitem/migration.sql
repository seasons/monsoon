/*
  Warnings:

  - A unique constraint covering the columns `[productVariant,customer]` on the table `BagItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BagItem" ADD COLUMN     "physicalProduct" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "BagItem.productVariant_customer_unique" ON "BagItem"("productVariant", "customer");

-- AddForeignKey
ALTER TABLE "BagItem" ADD FOREIGN KEY ("physicalProduct") REFERENCES "PhysicalProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
