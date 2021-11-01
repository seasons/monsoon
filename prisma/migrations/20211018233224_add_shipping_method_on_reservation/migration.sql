-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "shippingMethod" VARCHAR(30);

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "shippingMethod" VARCHAR(30);

-- AddForeignKey
ALTER TABLE "Reservation" ADD FOREIGN KEY ("shippingMethod") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("shippingMethod") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
