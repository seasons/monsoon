/*
  Warnings:

  - The values [Returned] on the enum `ReservationPhysicalProductStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReservationPhysicalProductStatus_new" AS ENUM ('Queued', 'Picked', 'Packed', 'ShippedToCustomer', 'ShippedToBusiness', 'DeliveredToCustomer', 'DeliveredToBusiness', 'ReturnProcessed', 'ResetEarly', 'Hold', 'Lost');
ALTER TABLE "ReservationPhysicalProduct" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReservationPhysicalProduct" ALTER COLUMN "status" TYPE "ReservationPhysicalProductStatus_new" USING ("status"::text::"ReservationPhysicalProductStatus_new");
ALTER TYPE "ReservationPhysicalProductStatus" RENAME TO "ReservationPhysicalProductStatus_old";
ALTER TYPE "ReservationPhysicalProductStatus_new" RENAME TO "ReservationPhysicalProductStatus";
DROP TYPE "ReservationPhysicalProductStatus_old";
ALTER TABLE "ReservationPhysicalProduct" ALTER COLUMN "status" SET DEFAULT 'Queued';
COMMIT;
