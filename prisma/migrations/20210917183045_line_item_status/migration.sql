-- CreateEnum
CREATE TYPE "OrderLineItemStatus" AS ENUM ('Previous', 'Current');

-- AlterTable
ALTER TABLE "OrderLineItem" ADD COLUMN     "status" "OrderLineItemStatus" NOT NULL DEFAULT E'Current';
