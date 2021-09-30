/*
  Warnings:

  - The values [Received] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('Queued', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Hold', 'Blocked', 'Unknown', 'Lost', 'ReturnPending');
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "ReservationStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "previousReservationWasPacked" BOOLEAN NOT NULL DEFAULT false;
