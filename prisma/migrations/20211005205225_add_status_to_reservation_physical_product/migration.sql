-- CreateEnum
CREATE TYPE "ReservationPhysicalProductStatus" AS ENUM ('Queued', 'Picked', 'Packed', 'ShippedToCustomer', 'ShippedToBusiness', 'DeliveredToCustomer', 'DeliveredToBusiness', 'ReturnProcessed', 'ResetEarly', 'Hold', 'Lost');

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "status" "ReservationPhysicalProductStatus" NOT NULL DEFAULT E'Queued';
