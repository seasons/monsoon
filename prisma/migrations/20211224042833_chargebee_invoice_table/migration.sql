/*
  Warnings:

  - A unique constraint covering the columns `[chargebeeInvoice]` on the table `RentalInvoice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ChargebeeInvoiceStatus" AS ENUM ('Paid', 'PaymentDue', 'NotPaid', 'Pending', 'Voided', 'Posted');

-- AlterEnum
ALTER TYPE "RentalInvoiceStatus" ADD VALUE 'ChargePending';

-- AlterTable
ALTER TABLE "RentalInvoice" ADD COLUMN     "chargebeeInvoice" VARCHAR(30),
ADD COLUMN     "processedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ChargebeeInvoice" (
    "chargebeeId" VARCHAR(30) NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "ChargebeeInvoiceStatus" NOT NULL,
    "invoiceCreatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("chargebeeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalInvoice_chargebeeInvoice_unique" ON "RentalInvoice"("chargebeeInvoice");

-- AddForeignKey
ALTER TABLE "RentalInvoice" ADD FOREIGN KEY ("chargebeeInvoice") REFERENCES "ChargebeeInvoice"("chargebeeId") ON DELETE SET NULL ON UPDATE CASCADE;
