/*
  Warnings:

  - You are about to drop the column `isDeliveredToBusiness` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isDeliveredToCustomer` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isLost` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isPurchased` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `isResetEarlyByAdmin` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - Added the required column `hasBeenDeliveredToBusiness` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasBeenDeliveredToCustomer` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasBeenLost` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasBeenPurchased` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasBeenResetEarlyByAdmin` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" DROP COLUMN "isDeliveredToBusiness",
DROP COLUMN "isDeliveredToCustomer",
DROP COLUMN "isLost",
DROP COLUMN "isPurchased",
DROP COLUMN "isResetEarlyByAdmin",
ADD COLUMN     "hasBeenDeliveredToBusiness" BOOLEAN NOT NULL,
ADD COLUMN     "hasBeenDeliveredToCustomer" BOOLEAN NOT NULL,
ADD COLUMN     "hasBeenLost" BOOLEAN NOT NULL,
ADD COLUMN     "hasBeenPurchased" BOOLEAN NOT NULL,
ADD COLUMN     "hasBeenResetEarlyByAdmin" BOOLEAN NOT NULL;
