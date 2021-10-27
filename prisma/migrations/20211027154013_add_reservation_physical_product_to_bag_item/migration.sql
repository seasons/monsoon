/*
  Warnings:

  - You are about to drop the column `pickupWindowId` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reservationPhysicalProduct]` on the table `BagItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ReservationPhysicalProductStatus" ADD VALUE 'Returned';

-- DropForeignKey
ALTER TABLE "ReservationPhysicalProduct" DROP CONSTRAINT "ReservationPhysicalProduct_id_fkey";

-- AlterTable
ALTER TABLE "BagItem" ADD COLUMN     "reservationPhysicalProduct" VARCHAR(30);

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" DROP COLUMN "pickupWindowId",
ALTER COLUMN "isNew" SET DEFAULT false,
ALTER COLUMN "isPurchased" SET DEFAULT false,
ALTER COLUMN "hasReturnProcessed" SET DEFAULT false,
ALTER COLUMN "isResetEarlyByAdmin" SET DEFAULT false,
ALTER COLUMN "hasCustomerReturnIntent" SET DEFAULT false,
ALTER COLUMN "isLost" SET DEFAULT false,
ALTER COLUMN "isDeliveredToCustomer" SET DEFAULT false,
ALTER COLUMN "isDeliveredToBusiness" SET DEFAULT false,
ALTER COLUMN "hasBeenScannedOnInbound" SET DEFAULT false,
ALTER COLUMN "hasBeenScannedOnOutbound" SET DEFAULT false;

-- CreateTable
CREATE TABLE "_RentalInvoiceToReservationPhysicalProducts" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RentalInvoiceToReservationPhysicalProducts_AB_unique" ON "_RentalInvoiceToReservationPhysicalProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_RentalInvoiceToReservationPhysicalProducts_B_index" ON "_RentalInvoiceToReservationPhysicalProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "BagItem_reservationPhysicalProduct_unique" ON "BagItem"("reservationPhysicalProduct");

-- AddForeignKey
ALTER TABLE "BagItem" ADD FOREIGN KEY ("reservationPhysicalProduct") REFERENCES "ReservationPhysicalProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("reservation") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToReservationPhysicalProducts" ADD FOREIGN KEY ("A") REFERENCES "RentalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToReservationPhysicalProducts" ADD FOREIGN KEY ("B") REFERENCES "ReservationPhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
