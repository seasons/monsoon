/*
  Warnings:

  - You are about to drop the column `user` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `physicalProduct` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `reservation` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - You are about to drop the column `shippingMethod` on the `ReservationPhysicalProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reservationPhysicalProduct]` on the table `BagItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `physicalProductId` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservationId` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ReservationPhysicalProductStatus" ADD VALUE 'Returned';

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_user_fkey";

-- DropForeignKey
ALTER TABLE "ReservationPhysicalProduct" DROP CONSTRAINT "ReservationPhysicalProduct_id_fkey";

-- DropForeignKey
ALTER TABLE "ReservationPhysicalProduct" DROP CONSTRAINT "ReservationPhysicalProduct_physicalProduct_fkey";

-- DropForeignKey
ALTER TABLE "ReservationPhysicalProduct" DROP CONSTRAINT "ReservationPhysicalProduct_shippingMethod_fkey";

-- AlterTable
ALTER TABLE "BagItem" ADD COLUMN     "reservationPhysicalProduct" VARCHAR(30);

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "user";

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" DROP COLUMN "physicalProduct",
DROP COLUMN "reservation",
DROP COLUMN "shippingMethod",
ADD COLUMN     "physicalProductId" VARCHAR(30) NOT NULL,
ADD COLUMN     "reservationId" VARCHAR(30) NOT NULL,
ADD COLUMN     "shippingMethodId" VARCHAR(30),
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
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("physicalProductId") REFERENCES "PhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToReservationPhysicalProducts" ADD FOREIGN KEY ("A") REFERENCES "RentalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RentalInvoiceToReservationPhysicalProducts" ADD FOREIGN KEY ("B") REFERENCES "ReservationPhysicalProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
