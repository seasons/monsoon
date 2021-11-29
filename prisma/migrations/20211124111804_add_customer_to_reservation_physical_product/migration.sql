/*
  Warnings:

  - Added the required column `customerId` to the `ReservationPhysicalProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "customerId" VARCHAR(30) NOT NULL;

-- AddForeignKey
ALTER TABLE "ReservationPhysicalProduct" ADD FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
