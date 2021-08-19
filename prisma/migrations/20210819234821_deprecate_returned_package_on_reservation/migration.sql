/*
  Warnings:

  - You are about to drop the column `returnedPackage` on the `Reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_returnedPackage_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "returnedPackage";
