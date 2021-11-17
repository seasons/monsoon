-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "shippingMethod" VARCHAR(30);

-- AddForeignKey
ALTER TABLE "Package" ADD FOREIGN KEY ("shippingMethod") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
