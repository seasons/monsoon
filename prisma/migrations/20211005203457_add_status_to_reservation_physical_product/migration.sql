/*
  Warnings:

  - Added the required column `status` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReservationPhysicalProductStatus" AS ENUM ('Queued', 'Picked', 'Packed', 'ShippedToCustomer', 'ShippedToBusiness', 'DeliveredToCustomer', 'DeliveredToBusiness', 'ReturnProcessed', 'ResetEarly', 'Hold', 'Lost');

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "status" "ReservationPhysicalProductStatus" NOT NULL;
