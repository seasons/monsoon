/*
  Warnings:

  - Made the column `estimatedTotal` on table `RentalInvoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RentalInvoice" ALTER COLUMN "estimatedTotal" SET NOT NULL,
ALTER COLUMN "estimatedTotal" SET DEFAULT 0;
