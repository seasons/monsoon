/*
  Warnings:

  - You are about to drop the column `shippingOption` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `ShippingOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ShippingCode" ADD VALUE 'Pickup';

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_shippingOption_fkey";

-- DropForeignKey
ALTER TABLE "ShippingOption" DROP CONSTRAINT "ShippingOption_destination_fkey";

-- DropForeignKey
ALTER TABLE "ShippingOption" DROP CONSTRAINT "ShippingOption_origin_fkey";

-- DropForeignKey
ALTER TABLE "ShippingOption" DROP CONSTRAINT "ShippingOption_shippingMethod_fkey";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "shippingOption";

-- DropTable
DROP TABLE "ShippingOption";
