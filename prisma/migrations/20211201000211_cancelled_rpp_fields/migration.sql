-- AlterEnum
ALTER TYPE "ReservationPhysicalProductStatus" ADD VALUE 'Cancelled';

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "cancelledAt" TIMESTAMP(3);
