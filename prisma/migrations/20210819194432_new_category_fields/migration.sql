/*
  Warnings:

  - Made the column `reservation` on table `ReservationFeedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "dryCleaningFee" DOUBLE PRECISION,
ADD COLUMN     "recoupment" DOUBLE PRECISION NOT NULL DEFAULT 4,
ADD COLUMN     "singularName" TEXT,
ALTER COLUMN "image" SET DATA TYPE JSONB;

-- AlterTable
ALTER TABLE "ReservationFeedback" ALTER COLUMN "reservation" SET NOT NULL;
