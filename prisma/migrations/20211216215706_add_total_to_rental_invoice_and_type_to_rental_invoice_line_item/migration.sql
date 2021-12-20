-- CreateEnum
CREATE TYPE "RentalInvoiceLineItemType" AS ENUM ('PhysicalProduct', 'Package', 'ProcessingFee');

-- AlterTable
ALTER TABLE "RentalInvoice" ADD COLUMN     "total" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RentalInvoiceLineItem" ADD COLUMN     "type" "RentalInvoiceLineItemType" NOT NULL DEFAULT E'PhysicalProduct';
