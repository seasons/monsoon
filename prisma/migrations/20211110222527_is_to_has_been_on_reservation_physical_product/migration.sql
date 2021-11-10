/*
  Warnings:

  - You are about to drop the column `isDeliveredToBusiness` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isDeliveredToCustomer` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isLost` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isPurchased` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isResetEarlyByAdmin` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" DROP COLUMN "isDeliveredToBusiness",
DROP COLUMN "isDeliveredToCustomer",
DROP COLUMN "isLost",
DROP COLUMN "isPurchased",
DROP COLUMN "isResetEarlyByAdmin",
ADD COLUMN     "hasBeenDeliveredToBusiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasBeenDeliveredToCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasBeenLost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasBeenPurchased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasBeenResetEarlyByAdmin" BOOLEAN NOT NULL DEFAULT false;
