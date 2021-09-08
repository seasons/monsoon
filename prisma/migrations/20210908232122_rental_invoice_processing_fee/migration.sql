/*
  Warnings:

  - You are about to alter the column `price` on the `RentalInvoiceLineItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterEnum
ALTER TYPE "RentalInvoiceStatus" ADD VALUE 'ChargeFailed';

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "amount" INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "recoupment" DROP DEFAULT;

-- AlterTable
ALTER TABLE "RentalInvoiceLineItem" ADD COLUMN     "name" TEXT,
ALTER COLUMN "physicalProduct" DROP NOT NULL,
ALTER COLUMN "daysRented" DROP NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;
