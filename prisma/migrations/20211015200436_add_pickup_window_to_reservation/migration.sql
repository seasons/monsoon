-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "pickupWindowId" TEXT;

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "pickupWindowId" TEXT;
