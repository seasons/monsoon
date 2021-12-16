-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('DoneWearing', 'FitTooSmall', 'FitTooBig', 'WasDamaged', 'Other');

-- AlterTable
ALTER TABLE "ReservationPhysicalProduct" ADD COLUMN     "returnReason" "ReturnReason";
