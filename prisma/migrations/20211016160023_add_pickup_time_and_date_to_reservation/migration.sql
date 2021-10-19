-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "pickupDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ShippingMethod" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
