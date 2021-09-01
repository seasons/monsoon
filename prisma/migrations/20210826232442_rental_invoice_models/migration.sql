/*
  Warnings:

  - A unique constraint covering the columns `[returnedPackage]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sentPackage]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RentalInvoiceStatus" AS ENUM ('Draft', 'Billed');

-- CreateTable
CREATE TABLE "RentalInvoice" (
    "id" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "membership" VARCHAR(30) NOT NULL,
    "billingStartAt" TIMESTAMP(3) NOT NULL,
    "billingEndAt" TIMESTAMP(3) NOT NULL,
    "status" "RentalInvoiceStatus" NOT NULL DEFAULT E'Draft',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalInvoiceLineItem" (
    "id" VARCHAR(30) NOT NULL,
    "physicalProduct" VARCHAR(30) NOT NULL,
    "rentalInvoice" VARCHAR(30) NOT NULL,
    "daysRented" INTEGER NOT NULL,
    "rentalStartedAt" TIMESTAMP(3),
    "rentalEndedAt" TIMESTAMP(3),
    "comment" TEXT,
    "taxRate" DOUBLE PRECISION,
    "taxName" TEXT,
    "taxPercentage" DOUBLE PRECISION,
    "taxPrice" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RentalInvoiceToReservations" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateTable
CREATE TABLE "_RentalInvoiceToProducts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RentalInvoiceToReservations_AB_unique" ON "_RentalInvoiceToReservations"("A", "B");

-- CreateIndex
CREATE INDEX "_RentalInvoiceToReservations_B_index" ON "_RentalInvoiceToReservations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RentalInvoiceToProducts_AB_unique" ON "_RentalInvoiceToProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_RentalInvoiceToProducts_B_index" ON "_RentalInvoiceToProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_returnedPackage_unique" ON "Reservation"("returnedPackage");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_sentPackage_unique" ON "Reservation"("sentPackage");

-- AddForeignKey
ALTER TABLE "RentalInvoice" ADD FOREIGN KEY ("membership") REFERENCES "CustomerMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalInvoiceLineItem" ADD FOREIGN KEY ("physicalProduct") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalInvoiceLineItem" ADD FOREIGN KEY ("rentalInvoice") REFERENCES "RentalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToReservations" ADD FOREIGN KEY ("A") REFERENCES "RentalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToReservations" ADD FOREIGN KEY ("B") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToProducts" ADD FOREIGN KEY ("A") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToProducts" ADD FOREIGN KEY ("B") REFERENCES "RentalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
