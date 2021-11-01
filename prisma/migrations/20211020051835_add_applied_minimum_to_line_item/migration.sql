-- AlterEnum
ALTER TYPE "EmailId" ADD VALUE 'RestockNotification';

-- AlterTable
ALTER TABLE "RentalInvoiceLineItem" ADD COLUMN     "appliedMinimum" BOOLEAN DEFAULT false;
