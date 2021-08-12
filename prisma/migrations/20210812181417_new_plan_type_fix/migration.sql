/*
  Warnings:

  - The values [Access,Guest] on the enum `BottomSizeType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[admissions]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[top]` on the table `Size` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BottomSizeType_new" AS ENUM ('WxL', 'US', 'EU', 'JP', 'Letter');
ALTER TABLE "BottomSize" ALTER COLUMN "type" TYPE "BottomSizeType_new" USING ("type"::text::"BottomSizeType_new");
ALTER TYPE "BottomSizeType" RENAME TO "BottomSizeType_old";
ALTER TYPE "BottomSizeType_new" RENAME TO "BottomSizeType";
DROP TYPE "BottomSizeType_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentPlanTier" ADD VALUE 'Access';
ALTER TYPE "PaymentPlanTier" ADD VALUE 'Guest';

-- AlterTable
ALTER TABLE "PhysicalProduct" ALTER COLUMN "barcoded" SET DEFAULT false;

-- AlterTable
ALTER TABLE "PhysicalProductQualityReport" ALTER COLUMN "published" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "wholesalePrice" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT E'Customer',
ALTER COLUMN "sendSystemEmails" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_admissions_unique" ON "Customer"("admissions");

-- CreateIndex
CREATE UNIQUE INDEX "Size_top_unique" ON "Size"("top");
