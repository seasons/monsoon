/*
  Warnings:

  - You are about to drop the column `hasBeenPurchased` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ReservationPhysicalProductStatus" ADD VALUE 'Purchased';

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" DROP COLUMN "hasBeenPurchased";
